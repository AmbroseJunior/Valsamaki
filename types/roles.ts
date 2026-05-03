export type UserRole = 'guest' | 'user' | 'producer' | 'admin'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  user: 1,
  producer: 2,
  admin: 3,
}

export function hasMinimumRole(userRole: UserRole, required: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[required]
}

export function isGuest(role: UserRole): boolean {
  return role === 'guest'
}
