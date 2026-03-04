/**
 * lib/role-hierarchy.ts — Role Hierarchy Utility (DBStudio Base)
 *
 * Defines the role hierarchy and provides helper functions to enforce
 * the principle that a user cannot manage roles equal to or higher than their own.
 *
 * Hierarchy levels (lower number = higher privilege):
 *   1: super_admin  — can manage everyone
 *   2: admin        — can manage custom roles and "user", not super_admin
 *   3: (custom)     — intermediate roles have level 3
 *   4: user         — lowest level, entry-level role
 */

/** Map of built-in role names to their hierarchy level. Lower = higher privilege. */
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 1,
  admin: 2,
  // custom roles are dynamically assigned level 3
  user: 4,
};

/**
 * Get the hierarchy level of a role.
 * Built-in roles use the fixed map; unknown roles default to level 3.
 */
export function getRoleLevel(roleName: string): number {
  return ROLE_HIERARCHY[roleName] ?? 3;
}

/**
 * Get the highest privilege level (lowest number) among a set of roles.
 */
export function getHighestPrivilege(roles: string[]): number {
  if (roles.length === 0) return 99; // no roles = no privilege
  return Math.min(...roles.map(getRoleLevel));
}

/**
 * Check if an actor (by their roles) can manage a target role.
 *
 * Rule: An actor can only manage roles with a STRICTLY LOWER privilege (higher number).
 * e.g., admin (level 2) CAN manage custom roles (level 3) and user (level 4).
 *       admin (level 2) CANNOT manage super_admin (level 1) or admin itself (level 2).
 *
 * @param actorRoles  - The roles of the user performing the action
 * @param targetRoleName - The name of the role being acted on
 */
export function canManageRole(actorRoles: string[], targetRoleName: string): boolean {
  const actorLevel = getHighestPrivilege(actorRoles);
  const targetLevel = getRoleLevel(targetRoleName);
  // Actor must have a strictly higher privilege (lower level number) than the target
  return actorLevel < targetLevel;
}

/**
 * Check if an actor (by their roles) can manage a target user (by the user's roles).
 *
 * Rule: An actor can manage a user ONLY IF they can manage ALL of the user's roles.
 *
 * @param actorRoles  - The roles of the user performing the action
 * @param targetUserRoles - The roles of the user being managed
 */
export function canManageUser(actorRoles: string[], targetUserRoles: string[]): boolean {
  if (targetUserRoles.length === 0) return true; // user with no roles can always be managed
  return targetUserRoles.every((role) => canManageRole(actorRoles, role));
}

/**
 * Filter a list of roles to only those that the actor can assign.
 *
 * @param actorRoles - The roles of the user performing the assignment
 * @param allRoles   - All available role names
 */
export function getAssignableRoles(actorRoles: string[], allRoles: string[]): string[] {
  return allRoles.filter((role) => canManageRole(actorRoles, role));
}
