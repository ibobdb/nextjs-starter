'use client';

import { useState } from 'react';
import { Trash2, Download, UserPlus, TestTube, Server, Monitor, MessageSquare, AlertTriangle, Info, Edit3, Fingerprint, MousePointerClick } from 'lucide-react';
import { useConfirm, useAlert, usePrompt } from '@/lib/dialog';
import { SearchableComboBox } from '@/components/common/searchable-combobox';
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

// ─── Server-side fetcher (simulated) ────────────────────────────────────────

async function fetchEmployees(params: ServerFetchParams): Promise<ServerFetchResult<Employee>> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400));

  let data = [...ALL_EMPLOYEES];

  // Filter
  if (params.search) {
    const q = params.search.toLowerCase();
    data = data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }

  // Sort
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

// ─── Client-mode Table ──────────────────────────────────────────────────────

function ClientSideExample() {
  const dt = useDataTable<Employee>({
    mode: 'client',
    data: ALL_EMPLOYEES,
    columns,
    defaultPageSize: 10,
  });

  const handleBulkDelete = () => {
    toast.success(`Deleted ${dt.selectedRows.length} employee(s) (demo)`);
    dt.clearSelection();
  };

  const handleExport = () => {
    const csv = dt.selectedRows.map((r) => `${r.name},${r.email},${r.department}`).join('\n');
    toast.success(`Exported ${dt.selectedRows.length} rows (demo)\n${csv.slice(0, 80)}...`);
  };

  return (
    <DataTable
      {...dt}
      searchPlaceholder="Search employees..."
      actions={
        <Button size="sm" className="gap-2">
          <UserPlus className="h-3.5 w-3.5" />
          Add Employee
        </Button>
      }
      bulkActions={
        <DataTableActionGroup>
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </DataTableActionGroup>
      }
      emptyTitle="No employees found"
      emptyDescription="No employees match your search criteria."
    />
  );
}

// ─── Server-mode Table ──────────────────────────────────────────────────────

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
      searchPlaceholder="Search employees (server)..."
      actions={
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="h-3.5 w-3.5" />
          Export All
        </Button>
      }
      bulkActions={
        <DataTableActionGroup>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
            onClick={() => {
              toast.success(`Server-delete ${dt.selectedRows.length} items (demo)`);
              dt.clearSelection();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </Button>
        </DataTableActionGroup>
      }
      emptyTitle="No employees found"
      emptyDescription="Try a different search term."
    />
  );
}

// ─── Dialogs Demo ───────────────────────────────────────────────────────────

function DialogsExample() {
  const confirm = useConfirm();
  const alert = useAlert();
  const prompt = usePrompt();
  const [lastResult, setLastResult] = useState<string | null>(null);

  const demos = [
    {
      label: 'Confirm (default)',
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary',
      description: 'Standard yes/no confirmation',
      code: `const ok = await confirm({ title: 'Are you sure?', ... })`,
      action: async () => {
        const ok = await confirm({
          title: 'Save changes?',
          description: 'Your unsaved changes will be committed.',
          confirmLabel: 'Save',
        });
        setLastResult(ok ? '✅ Confirmed' : '❌ Cancelled');
      },
    },
    {
      label: 'Confirm (destructive)',
      icon: Trash2,
      color: 'bg-destructive/10 text-destructive',
      description: 'Red confirm button for dangerous actions',
      code: `const ok = await confirm({ variant: 'destructive', ... })`,
      action: async () => {
        const ok = await confirm({
          title: 'Delete this item?',
          description: 'This action cannot be undone. The item will be permanently removed.',
          confirmLabel: 'Delete',
          variant: 'destructive',
        });
        setLastResult(ok ? '✅ Deleted (demo)' : '❌ Cancelled');
      },
    },
    {
      label: 'Alert – Info',
      icon: Info,
      color: 'bg-blue-500/10 text-blue-600',
      description: 'Single-button informational dialog',
      code: `await alert({ title: 'FYI', variant: 'info' })`,
      action: async () => {
        await alert({
          title: 'Feature coming soon',
          description: 'This feature is currently in development and will be available in the next release.',
          variant: 'info',
        });
        setLastResult('ℹ️ Alert dismissed');
      },
    },
    {
      label: 'Alert – Warning',
      icon: AlertTriangle,
      color: 'bg-amber-500/10 text-amber-600',
      description: 'Warning-styled alert',
      code: `await alert({ title: '...', variant: 'warning' })`,
      action: async () => {
        await alert({
          title: 'Session expiring soon',
          description: 'Your session will expire in 5 minutes. Please save your work.',
          variant: 'warning',
          confirmLabel: 'Got it',
        });
        setLastResult('⚠️ Warning acknowledged');
      },
    },
    {
      label: 'Prompt',
      icon: Edit3,
      color: 'bg-emerald-500/10 text-emerald-600',
      description: 'Ask user for text input',
      code: `const value = await prompt({ title: 'Rename...', placeholder: '...' })`,
      action: async () => {
        const value = await prompt({
          title: 'Rename team',
          description: 'Enter a new name for this team.',
          label: 'Team name',
          placeholder: 'e.g. Product Design',
          defaultValue: 'Current Team Name',
        });
        setLastResult(value !== null ? `✏️ New name: "${value}"` : '❌ Cancelled');
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demos.map(({ label, icon: Icon, color, description, code, action }) => (
          <button
            key={label}
            onClick={action}
            className="group text-left rounded-xl border border-border/50 bg-card p-5 hover:border-border hover:shadow-sm transition-all space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-4.5 w-4.5" size={18} />
              </div>
              <span className="font-semibold text-sm">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
            <code className="block text-[10px] font-mono bg-muted/60 rounded-md px-2 py-1.5 text-muted-foreground truncate">
              {code}
            </code>
          </button>
        ))}
      </div>

      {lastResult && (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200 rounded-xl border border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            Result: <span className="text-foreground">{lastResult}</span>
          </span>
          <button
            onClick={() => setLastResult(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            clear
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Combobox Demo ────────────────────────────────────────────────────────────

const STATIC_ROLES = [
  { value: 'admin', label: 'Administrator', icon: <Fingerprint className="h-4 w-4" /> },
  { value: 'editor', label: 'Content Editor', icon: <Edit3 className="h-4 w-4" /> },
  { value: 'viewer', label: 'Viewer', icon: <Monitor className="h-4 w-4" /> },
  { value: 'guest', label: 'Guest User', icon: <UserPlus className="h-4 w-4" /> },
];

async function searchUsersAPI(query: string) {
  // Simulate 400ms API call
  await new Promise(r => setTimeout(r, 400));
  
  if (!query) return ALL_EMPLOYEES.slice(0, 5).map(e => ({ value: e.id, label: e.name }));
  
  return ALL_EMPLOYEES
    .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(e => ({ value: e.id, label: e.name }));
}

function ComboboxExample() {
  const [clientRole, setClientRole] = useState('');
  const [serverUser, setServerUser] = useState('');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Client Mode */}
      <div className="space-y-4 p-5 rounded-xl border border-border/50 bg-card">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> Client Mode
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Data statis di-load di memori. Pencarian terjadi secara instan tanpa delay (cmdk native).
          </p>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Select Role</label>
          <SearchableComboBox
            mode="client"
            options={STATIC_ROLES}
            value={clientRole}
            onChange={setClientRole}
            placeholder="Select a role..."
            searchPlaceholder="Search roles..."
            allowClear
          />
          <p className="text-xs text-muted-foreground">
            Selected Value: {clientRole || <span className="italic">none</span>}
          </p>
        </div>
      </div>

      {/* Server Mode */}
      <div className="space-y-4 p-5 rounded-xl border border-border/50 bg-card">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" /> Server Mode
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Fetch data ke API saat mengetik dengan <code className="bg-muted px-1 py-0.5 rounded">useDebounce(300ms)</code>.
          </p>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Assign User (Search 87 records)</label>
          <SearchableComboBox
            mode="server"
            fetcher={searchUsersAPI}
            value={serverUser}
            onChange={setServerUser}
            placeholder="Search user..."
            searchPlaceholder="Type names (e.g. Alice)..."
            emptyText="No users found."
            loadingText="Searching database..."
            allowClear
          />
          <p className="text-xs text-muted-foreground">
            Selected Value: {serverUser || <span className="italic">none</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DataTableDemoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="DataTable Demo"
        description="Reusable DataTable system — supports client-side and server-side modes with search, sort, selection, and pagination built-in."
        icon={TestTube}
      />

      <Tabs defaultValue="client">
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0 h-auto gap-0 mb-6 flex-wrap">
          {[
            { value: 'client', label: 'Client Table', icon: Monitor },
            { value: 'server', label: 'Server Table', icon: Server },
            { value: 'dialogs', label: 'Dialogs', icon: MessageSquare },
            { value: 'combobox', label: 'Combobox', icon: MousePointerClick },
          ].map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground px-4 pb-3 pt-1 font-medium text-sm gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="client" className="mt-0">
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">87 employees</span> loaded in memory.
              Search, sort, and paginate instantly in the browser — no network calls.
            </p>
          </div>
          <ClientSideExample />
        </TabsContent>

        <TabsContent value="server" className="mt-0">
          <div className="space-y-2 mb-4">
            <p className="text-sm text-muted-foreground">
              Each search/sort/page change calls the <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">fetcher</code> with
              updated params — simulating a real API call with 400ms delay.
            </p>
          </div>
          <ServerSideExample />
        </TabsContent>

        <TabsContent value="dialogs" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Click any card to trigger the dialog. Uses <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">useConfirm</code>,{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">useAlert</code>, and{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">usePrompt</code> — entirely Promise-based, no local state needed.
            </p>
          </div>
          <DialogsExample />
        </TabsContent>

        <TabsContent value="combobox" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">SearchableComboBox</code> component supports both in-memory static filtering and debounced async API fetching.
            </p>
          </div>
          <ComboboxExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}
