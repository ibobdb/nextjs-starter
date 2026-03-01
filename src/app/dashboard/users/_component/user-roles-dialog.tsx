"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  if (!user) return null;

  // Set ID role yang sudah dimiliki user saat ini
  const userRoleIds = new Set(user.userRoles.map((ur) => ur.roleId));

  const handleToggleRole = async (roleId: number, hasRole: boolean) => {
    setIsUpdating(roleId);
    try {
      if (hasRole) {
        // Hapus role
        await usersApi.removeRole(user.id, roleId);
        toast.success("Role berhasil dihapus dari user");
      } else {
        // Tambah role
        await usersApi.assignRole(user.id, roleId);
        toast.success("Role berhasil ditambahkan ke user");
      }
      // Re-fetch daftar user untuk memperbarui tabel & dialog
      mutate("users");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengupdate role user");
    } finally {
      setIsUpdating(null);
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
          <div className="space-y-4 py-4">
            {allRoles?.map((role) => {
              const hasRole = userRoleIds.has(role.id);
              const disabled = isUpdating === role.id;

              return (
                <div key={role.id} className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={hasRole}
                    onCheckedChange={() => handleToggleRole(role.id, hasRole)}
                    disabled={disabled}
                  />
                  <div className="grid gap-1.5 leading-none cursor-pointer flex-1">
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
                  {isUpdating === role.id && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Updating...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </DataLoader>

      </DialogContent>
    </Dialog>
  );
}
