"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useData } from "@/hooks/use-data";
import { accessApi } from "@/services/access/api";
import type { Role } from "@/services/access/api";
import { usersApi } from "@/services/users/api";
import type { User } from "@/services/users/api";
import { DataLoader } from "@/components/common/data-loader";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePermission } from "@/lib/rbac/hooks/usePermission";
import { useSession } from "@/hooks/use-session";
import { canManageRole, canManageUser } from "@/lib/role-hierarchy";
import { ShieldAlert } from "lucide-react";

interface UserRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
  const { user: currentUser } = useSession();
  const { allowed: canUpdate } = usePermission('user.update');
  const actorRoles = currentUser?.roles ?? [];

  // Ambil daftar semua roles dari sistem
  const { data: allRoles, isLoading, error, mutate: mutateRoles } = useData<Role[]>("roles", () =>
    accessApi.getRoles()
  );

  const [isUpdating, setIsUpdating] = useState(false);
  
  // Local state for selected roles
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());

  // Initialize state when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      setSelectedRoleIds(new Set(user.userRoles.map((ur) => ur.roleId)));
    }
  }, [user, open]);

  if (!user) return null;

  // Determine if the current actor can manage this target user at all
  const targetUserRoleNames = user.userRoles.map((ur) => ur.role.name);
  const actorCanManageUser = canManageUser(actorRoles, targetUserRoleNames);

  const handleToggleRole = (roleId: number, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      // If we are checking it, we clear out any others to enforce 1 role per user
      if (checked) {
        return new Set([roleId]);
      }
      
      // If we uncheck, we just clear it out
      const next = new Set(prev);
      next.delete(roleId);
      return next;
    });
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await usersApi.syncUserRoles(user.id, Array.from(selectedRoleIds));
      toast.success("User roles updated successfully");
      // Re-fetch user list to update table & dialog
      mutate("users");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update user roles");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Manage system access for {user.name} ({user.email}).
          </DialogDescription>
        </DialogHeader>

        {/* Warning if actor cannot manage this user */}
        {!actorCanManageUser && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
            <p>You cannot modify roles for this user because they have a role equal to or higher than yours in the hierarchy.</p>
          </div>
        )}

        <DataLoader
          isLoading={isLoading}
          error={error}
          onRetry={mutateRoles}
          skeletonVariant="list"
          skeletonProps={{ rows: 3 }}
        >
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {allRoles?.map((role) => {
              const hasRole = selectedRoleIds.has(role.id);
              const actorCanAssignThisRole = canManageRole(actorRoles, role.name);
              const isDisabled = isUpdating || !canUpdate || !actorCanManageUser || !actorCanAssignThisRole;

              return (
                <div
                  key={role.id}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg border p-3 transition-colors",
                    isDisabled ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50 cursor-pointer"
                  )}
                >
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={hasRole}
                    onCheckedChange={(checked) => handleToggleRole(role.id, checked === true)}
                    disabled={isDisabled}
                  />
                  <div 
                    className={cn("grid gap-1.5 leading-none flex-1", !isDisabled ? "cursor-pointer" : "cursor-not-allowed")} 
                    onClick={() => !isDisabled && handleToggleRole(role.id, !hasRole)}
                  >
                    <Label
                      htmlFor={`role-${role.id}`}
                      className={cn("font-medium", !isDisabled ? "cursor-pointer" : "cursor-not-allowed")}
                    >
                      {role.name}
                    </Label>
                    {!actorCanAssignThisRole && (
                      <p className="text-xs text-amber-600">
                        Requires higher privilege to assign
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DataLoader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || isLoading || !canUpdate || !actorCanManageUser}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
