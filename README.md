# Fleet Management Web

Feature-based React application for a large operations console. Server data lives in RTK Query. Client-only state lives in small Redux slices. Pages, forms, and endpoints stay inside the feature that owns them.

## Stack

- React 19, Vite, TypeScript (strict)
- Tailwind CSS 4
- React Router
- Redux Toolkit and RTK Query
- React Hook Form and Zod
- ESLint and Prettier

TypeScript is pinned to 6.0 because `typescript-eslint` does not yet support TypeScript 7. The compiler still runs in strict mode, including `noUncheckedIndexedAccess`.

TanStack Query, React Query, SWR, and Axios are not part of this app. HTTP goes through RTK Query's `fetchBaseQuery`.

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

Copy `.env.example` to `.env` before the first run. `npm run dev` serves the app at `http://localhost:5173`.

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API origin and prefix, with no trailing slash. Example: `http://localhost:3000/api/v1` |
| `VITE_APP_ENV` | `development`, `staging`, `production`, or `test` |

Vite inlines every `VITE_` variable into the browser bundle. Do not put secrets, private keys, or passwords in these files.

The API must allow the web origin with credentials (`Access-Control-Allow-Credentials: true` and a specific origin, not `*`) because refresh uses cookies.

## Folder map

```text
src/
  app/            store, listeners, providers, router
  components/     shared UI, layout, and feedback
  config/         environment, constants, app config
  features/       business modules
  hooks/          shared React hooks
  lib/            API client and browser storage
  pages/          app-level 404 and unauthorized screens
  schemas/        shared Zod schemas
  styles/         Tailwind theme and global CSS
  types/          shared API types
  utils/          pure helpers
```

`src/lib` is infrastructure: the HTTP client and storage. `src/utils` is pure helpers. Feature code does not import another feature's internals. Import another feature only through its `index.ts`.

## Redux store

`src/app/store.ts` configures one store:

- `api` — the RTK Query reducer
- `auth` — session principal and access token
- `ui` — theme, sidebar, and mobile navigation

Feature API slices are registered for their side effects in `src/app/registerFeatures.ts`. A new feature that only adds endpoints does not add a new reducer. A new feature that needs genuine client state adds one slice to `src/app/rootReducer.ts`.

Listeners in `src/app/listenerMiddleware.ts` persist theme and sidebar preferences, and on logout they clear the in-memory refresh token and reset the RTK Query cache.

Do not store API collections in slices. A `users` slice with a `users: []` array is the wrong place for directory data.

## RTK Query

`src/lib/api/baseApi.ts` creates the single `createApi` instance. Every feature extends it with `injectEndpoints`.

```text
baseApi
  authApi
  usersApi
  paymentsApi   (future)
```

`src/lib/api/baseQuery.ts` is the shared query:

- base URL from `VITE_API_URL`
- `Accept: application/json`
- `Authorization: Bearer <access token>` when a session exists
- `credentials: 'include'` for the refresh cookie
- one shared timeout

Generated hooks (`useGetUsersQuery`, `useCreateUserMutation`, and so on) own loading, error, cache, and refetch state.

### Adding an endpoint

Create `src/features/<feature>/api/<feature>Api.ts`:

```ts
export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query<Payment[], void>({
      query: () => '/payments',
      providesTags: (result) =>
        result
          ? [
              ...result.map((payment) => ({ type: 'Payment' as const, id: payment.id })),
              { type: 'Payments' as const, id: 'LIST' },
            ]
          : [{ type: 'Payments' as const, id: 'LIST' }],
    }),
  }),
})
```

Then:

1. Add the tag name to `tagTypes` in `src/lib/api/baseApi.ts`.
2. Import the API module from `src/app/registerFeatures.ts` so the endpoints exist at startup.
3. Export the hooks from the feature `index.ts` if other features need them.

Keep request and response types next to the feature. Validate responses with Zod in `transformResponse` when a bad payload should surface as a query error instead of a render crash.

## Cache invalidation

| Mutation | Tags invalidated |
| --- | --- |
| Create user | `Users` list |
| Update user | that `User` id |
| Delete user | that `User` id and the `Users` list |

The user list provides both the list tag and one `User` tag per row. Updating one user refetches the list because that list provided the user's tag. It does not refetch unrelated user records. Failed mutations invalidate nothing.

## Authentication

Auth HTTP lives in `src/features/auth/api/authApi.ts`:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`

Login and registration expect:

```json
{
  "accessToken": "string",
  "expiresIn": 900,
  "user": { "id": "string", "email": "string", "name": "string", "roles": ["admin"] }
}
```

`refreshToken` may also be returned. It is kept in memory only (`src/lib/storage/tokenStorage.ts`) and is never written to `localStorage` or `sessionStorage`. The preferred contract is an `HttpOnly`, `Secure`, `SameSite` cookie set by the API. On refresh, the client posts `{}` and relies on that cookie, or posts `{ "refreshToken" }` when the login response included one.

The access token is held in the auth slice so route guards and request headers can read it. Redux DevTools redact it. The slice stores the session principal (id, name, email, roles), not a cached user directory.

Startup calls `POST /auth/refresh` once. Success restores the session. Failure leaves the person signed out, without an error banner. A timer refreshes the access token 30 seconds before `expiresAt`, and at least 15 seconds apart, so a short-lived token cannot tight-loop.

### 401 flow

```text
request
  -> 401
  -> one shared refresh (concurrent 401s wait on the same call)
  -> retry the original request
  -> if refresh fails, or the retry is still 401, clear the session
```

Login, registration, logout, and refresh do not try to refresh themselves. A wrong password stays on the form.

Logout calls the API, then always clears the local session and the RTK Query cache, including when the network call fails.

## Routing

`src/app/router/routes.tsx` is the route table. Feature pages stay in `features/<feature>/pages` and are lazy-loaded.

| Route | Access |
| --- | --- |
| `/login`, `/register` | public; signed-in people are sent home |
| `/` | any authenticated session |
| `/users`, `/users/:userId` | authenticated, role `admin` or `manager` |
| `/unauthorized` | authenticated |
| anything else | 404 |

`RoleRoute` is the extension point for future role checks. Add the allowed roles beside the route and reuse them in the sidebar so navigation and the route guard cannot drift.

After login, the app returns to the page the person originally requested. The redirect target must be a same-origin path.

## Forms

Schemas live beside the feature, for example `features/auth/schemas/login.schema.ts`. Components use React Hook Form with `zodResolver`. Shared email, name, and password rules live in `src/schemas/common.schema.ts`. API field errors (`errors` or `fieldErrors` on a 400 or 422 body) are applied with `applyApiFieldErrors`. Other failures become the form's root alert.

## Errors, loading, and empty states

`normalizeApiError` maps 400, 401, 403, 404, 409, 422, 429, 500, timeouts, parse failures, and network failures to one message plus optional field errors. Screens use `QueryState`, `LoadingState`, `ErrorState`, and `EmptyState` instead of reimplementing that branching.

## Tailwind

`src/styles/tailwind.css` defines the utility theme. `src/styles/globals.css` holds the light and dark values for those tokens (`canvas`, `surface`, `ink`, `brand`, status colors, sidebar). Dark mode is the `dark` class on `<html>`, not `prefers-color-scheme` alone. The choice is `light`, `dark`, or `system`, stored under `fleet.theme`. An inline script in `index.html` applies it before React paints. Keep that storage key in sync with `STORAGE_KEYS.theme`.

Shared controls are in `src/components/ui` (button, input, select, modal, card, badge, spinner, alert, table, menu). Add a component when a second screen needs it.

## Adding a feature

Example: payments.

```text
src/features/payments/
  api/paymentsApi.ts
  components/
  hooks/
  pages/PaymentsPage.tsx
  schemas/
  types/
  index.ts
```

Add a slice only for client state that is truly global, such as a checkout draft. Do not add one for payment records returned by the API.

Then:

1. Add tag types on the base API.
2. Register `paymentsApi` in `src/app/registerFeatures.ts`.
3. Lazy-load the page from `src/app/router/routes.tsx`.
4. Wrap it in `RoleRoute` when a role is required.
5. Add a navigation item that uses the same role list.

No other feature module needs to change.
