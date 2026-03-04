'use client';

import { useState } from 'react';
import { MousePointerClick, Fingerprint, Edit3, Monitor, Server, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { SearchableComboBox } from '@/components/common/searchable-combobox';

// ─── Dummy Data ─────────────────────────────────────────────────────────────

const STATIC_ROLES = [
  { value: 'admin', label: 'Administrator', icon: <Fingerprint className="h-4 w-4" /> },
  { value: 'editor', label: 'Content Editor', icon: <Edit3 className="h-4 w-4" /> },
  { value: 'viewer', label: 'Viewer', icon: <Monitor className="h-4 w-4" /> },
  { value: 'guest', label: 'Guest User', icon: <UserPlus className="h-4 w-4" /> },
];

const ALL_USERS = Array.from({ length: 87 }, (_, i) => ({
  id: `usr-${i + 1}`,
  name: `User Name ${i + 1}`, // Replacing random logic for simplicity in demo
}));

async function searchUsersAPI(query: string) {
  // Simulate 400ms API call
  await new Promise(r => setTimeout(r, 400));
  
  if (!query) return ALL_USERS.slice(0, 5).map(e => ({ value: e.id, label: e.name }));
  
  return ALL_USERS
    .filter(e => e.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(e => ({ value: e.id, label: e.name }));
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ComboboxDemoPage() {
  const [clientRole, setClientRole] = useState('');
  const [serverUser, setServerUser] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Searchable Combobox"
        description="A reusable combobox component supporting both in-memory client-side static filtering and debounced async API fetching."
        icon={MousePointerClick}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Mode */}
        <div className="space-y-4 p-5 rounded-xl border border-border/50 bg-card">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" /> Client Mode
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Static data loaded in memory. Searching happens instantly without delay (native cmdk).
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
              Fetches data from API while typing using <code className="bg-muted px-1 py-0.5 rounded">useDebounce(300ms)</code>.
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
              searchPlaceholder="Type names (e.g. User Name 12)..."
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
    </div>
  );
}
