export function hasAnyRole(
  roles: readonly string[] | undefined,
  allow: readonly string[],
): boolean {
  if (!roles || allow.length === 0) return false
  return allow.some((role) => roles.includes(role))
}
