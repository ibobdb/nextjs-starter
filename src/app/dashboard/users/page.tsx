"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { AppTable } from "@/components/common/app-table";
import { DataLoader } from "@/components/common/data-loader";
import { useData } from "@/hooks/use-data";
import { usersApi } from "@/services/users/api";
import type { User } from "@/services/users/api";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { UserRolesDialog } from "./_component/user-roles-dialog";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/lib/rbac/hooks/usePermission";
import { useSession } from "@/hooks/use-session";
import { PermissionAlert } from "@/components/common/permission-alert";

export default function UsersPage() {
  const { user: currentUser } = useSession();
  const { allowed: canUpdate } = usePermission('user.update');
  const isSuperAdmin = currentUser?.roles?.includes('super_admin');
  const hasUpdateAccess = isSuperAdmin || canUpdate;

  const { data: users, isLoading, error, mutate } = useData<User[]>("users", () =>
    usersApi.getUsers()
  );

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Definisi Kolom Tabel
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-muted-foreground">
          {row.original.email}
        </div>
      ),
    },
    {
      id: "roles",
      header: "Roles",
      cell: ({ row }) => {
        const roles = row.original.userRoles;
        if (roles.length === 0) {
          return <span className="text-xs text-muted-foreground">No roles</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((r) => (
              <Badge key={r.roleId} variant={r.role.name === 'super_admin' ? 'default' : 'secondary'} className="text-xs font-normal">
                {r.role.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined Date",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return format(date, "dd MMM yyyy");
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(row.original);
              setDialogOpen(true);
            }}
            disabled={!hasUpdateAccess}
          >
            <Shield className="mr-2 h-4 w-4" />
            Manage Roles
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage user accounts, assign or revoke their role permissions within the system."
      />

      {!hasUpdateAccess && (
        <PermissionAlert 
          message="You do not have permission to manage user roles. Please contact an administrator for user update access."
        />
      )}

      <DataLoader
        isLoading={isLoading}
        error={error}
        onRetry={mutate}
        isEmpty={users?.length === 0}
        skeletonVariant="table"
        skeletonProps={{ rows: 5 }}
      >
        <AppTable
          data={users || []}
          columns={columns}
        />
      </DataLoader>

      <UserRolesDialog
        user={selectedUser}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedUser(null);
        }}
      />
    </div>
  );
}
