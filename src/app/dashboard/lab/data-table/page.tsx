'use client';

import { useState } from 'react';
import { Trash2, Download, UserPlus, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/page-header';
import { DataTable, DataTableColumnHeader, DataTableActionGroup } from '@/components/common/data-table';
import { useDataTable, type ServerFetchParams, type ServerFetchResult } from '@/hooks/use-data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ColumnDef } from '@tanstack/react-table';

// ─── Dummy Data ─────────────────────────────────────────────────────────────

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  joinedAt: string;
  salary: number;
};

const DEPARTMENTS = ['Engineering', 'Marketing', 'Design', 'Finance', 'HR', 'Sales'];
const ROLES = ['Manager', 'Lead', 'Senior', 'Mid', 'Junior', 'Intern'];
const STATUSES: Employee['status'][] = ['Active', 'Active', 'Active', 'Inactive', 'On Leave'];

function randomName() {
  const first = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Iris', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara'];
  const last = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
}

const ALL_EMPLOYEES: Employee[] = Array.from({ length: 87 }, (_, i) => {
  const name = randomName();
  const department = DEPARTMENTS[i % DEPARTMENTS.length];
  const role = ROLES[i % ROLES.length];
  const status = STATUSES[i % STATUSES.length];
  return {
    id: `emp-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
    department,
    role,
    status,
    joinedAt: new Date(2020 + (i % 5), i % 12, (i % 28) + 1).toISOString().slice(0, 10),
    salary: 40000 + Math.floor((i * 13) % 80) * 1000,
  };
});

// ─── Columns ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<Employee['status'], string> = {
  Active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  'On Leave': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
};

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
    cell: ({ row }) => {
      const initials = row.original.name.split(' ').map(n => n[0]).join('').slice(0, 2);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'department',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    enableSorting: true,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="outline" className={`text-[11px] ${STATUS_COLORS[row.original.status]}`}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'salary',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salary" className="justify-end" />,
    cell: ({ row }) => (
      <div className="text-right font-mono text-sm">
        ${row.original.salary.toLocaleString()}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: 'joinedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    enableSorting: true,
  },
];

// ─── Server fetcher ────────────────────────────────────────────────────────

async function fetchEmployees(params: ServerFetchParams): Promise<ServerFetchResult<Employee>> {
  await new Promise((r) => setTimeout(r, 400));
  let data = [...ALL_EMPLOYEES];

  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }

  if (params.sortField) {
    data.sort((a, b) => {
      const av = String(a[params.sortField as keyof Employee]);
      const bv = String(b[params.sortField as keyof Employee]);
      return params.sortDir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv);
    });
  }

  const total = data.length;
  const start = (params.page - 1) * params.pageSize;
  data = data.slice(start, start + params.pageSize);

  return { data, total };
}

// ─── Client Mode Component ─────────────────────────────────────────────────

function ClientSideExample() {
  const dt = useDataTable<Employee>({
    mode: 'client',
    data: ALL_EMPLOYEES,
    columns,
    defaultPageSize: 10,
  });

  return (
    <DataTable
      {...dt}
      searchPlaceholder="Search employees in memory..."
      actions={<Button size="sm" className="gap-2"><UserPlus className="h-3.5 w-3.5" />Add</Button>}
      bulkActions={
        <DataTableActionGroup>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => dt.clearSelection()}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </DataTableActionGroup>
      }
    />
  );
}

// ─── Server Mode Component ─────────────────────────────────────────────────

function ServerSideExample() {
  const dt = useDataTable<Employee>({
    mode: 'server',
    fetcher: fetchEmployees,
    columns,
    defaultPageSize: 10,
  });

  return (
    <DataTable
      {...dt}
      searchPlaceholder="Search employees via API..."
      actions={<Button size="sm" variant="outline" className="gap-2"><Download className="h-3.5 w-3.5" />Export</Button>}
      bulkActions={
        <DataTableActionGroup>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10" onClick={() => dt.clearSelection()}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </DataTableActionGroup>
      }
    />
  );
}

export default function DataTableDemoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Table UI"
        description="A highly reusable table component supporting both client-side and server-side modes."
        icon={TestTube}
      />

      <Tabs defaultValue="client">
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto gap-0 mb-6">
          <TabsTrigger value="client" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 pb-3">Client Mode</TabsTrigger>
          <TabsTrigger value="server" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground px-4 pb-3">Server Mode</TabsTrigger>
        </TabsList>
        <TabsContent value="client" className="mt-0">
          <ClientSideExample />
        </TabsContent>
        <TabsContent value="server" className="mt-0">
          <ServerSideExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}
