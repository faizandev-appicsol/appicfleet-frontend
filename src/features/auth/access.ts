/**
 * Frontend access helpers. These only shape the UI; the backend is the authority and
 * enforces every permission and tenant scope on each request.
 */

export function hasAnyRole(
  roles: readonly string[] | undefined,
  allow: readonly string[],
): boolean {
  if (!roles || allow.length === 0) return false
  return allow.some((role) => roles.includes(role))
}

export function hasPermission(
  permissions: readonly string[] | undefined,
  required: string,
): boolean {
  if (!permissions) return false
  return permissions.includes(required)
}

export function hasAnyPermission(
  permissions: readonly string[] | undefined,
  required: readonly string[],
): boolean {
  if (!permissions || required.length === 0) return false
  return required.some((permission) => permissions.includes(permission))
}
