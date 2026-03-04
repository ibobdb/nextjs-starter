'use client';

import { useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
import { accessApi } from '@/services/access/api';

import { RolesTab } from './_component/roles-tab';
import { PermissionsTab } from './_component/permissions-tab';
import { RolePermissionsTab } from './_component/role-permissions-tab';
import { MenusTab } from './_component/menus-tab';

export default function AccessPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.roles?.includes('super_admin');

  const handleSyncPermissions = async () => {
    try {
      setIsSyncing(true);
      const data = await accessApi.syncPermissions();
      
      if (!data.success) {
        throw new Error(data.message || 'Sync failed');
      }

      toast.success(data.message);
      // Wait a moment then refresh to update the tabs
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          icon={ShieldCheck}
          title="Access Control"
          description="Manage roles, permissions, and user access rights across the DB STUDIO Dashboard system."
        />
      </div>

      <Tabs defaultValue="roles">
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto gap-0">
          {[
            { value: 'roles', label: 'Roles' },
            { value: 'permissions', label: 'Permissions' },
            { value: 'role-permissions', label: 'Role Permissions' },
            { value: 'menus', label: 'Navigation Menus' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground px-4 pb-3 pt-1 font-medium text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesTab />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTab />
        </TabsContent>

        <TabsContent value="role-permissions" className="mt-6">
          <RolePermissionsTab />
        </TabsContent>

        <TabsContent value="menus" className="mt-6">
          <MenusTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
