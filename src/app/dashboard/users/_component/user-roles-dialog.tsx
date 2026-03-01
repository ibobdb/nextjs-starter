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

interface UserRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
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
      toast.success("Role user berhasil diperbarui");
      // Re-fetch daftar user untuk memperbarui tabel & dialog
      mutate("users");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate role user");
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
            Atur akses {user.name} ({user.email}) di dalam sistem.
          </DialogDescription>
        </DialogHeader>

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
              const disabled = isUpdating;

              return (
                <div key={role.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={hasRole}
                    onCheckedChange={(checked) => handleToggleRole(role.id, checked === true)}
                    disabled={disabled}
                  />
                  <div className="grid gap-1.5 leading-none cursor-pointer flex-1" onClick={() => !disabled && handleToggleRole(role.id, !hasRole)}>
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {role.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      ID: {role.id}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DataLoader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || isLoading}>
            {isUpdating ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
