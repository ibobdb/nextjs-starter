'use client';

import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/common/page-header';
import { RolesTab } from './_component/roles-tab';
import { PermissionsTab } from './_component/permissions-tab';
import { RolePermissionsTab } from './_component/role-permissions-tab';

export default function AccessPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title="Access Control"
        description="Kelola roles, permissions, dan hak akses user di seluruh sistem DBStudio."
      />

      <Tabs defaultValue="roles">
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto gap-0">
          {[
            { value: 'roles', label: 'Roles' },
            { value: 'permissions', label: 'Permissions' },
            { value: 'role-permissions', label: 'Role Permissions' },
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
      </Tabs>
    </div>
  );
}
