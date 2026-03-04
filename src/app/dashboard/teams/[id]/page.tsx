'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Users, Shield, Loader2, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/hooks/use-data';
import { teamsApi, type TeamMember } from '@/services/teams/api';
import { accessApi, type Permission } from '@/services/access/api';
import { usersApi } from '@/services/users/api';
import { useSession } from '@/hooks/use-session';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataLoader } from '@/components/common/data-loader';
import { Badge } from '@/components/ui/badge';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const MODULE_COLORS: Record<string, string> = {
  dashboard: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  user: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  roles: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  permissions: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  log: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  settings: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
};

type Tab = 'members' | 'permissions';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useSession();
  const actorRoles = user?.roles ?? [];
  const isAdmin = actorRoles.includes('admin') || actorRoles.includes('super_admin');

  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState<string>('');
  const [comboOpen, setComboOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Permission tab state
  const [assignedPermIds, setAssignedPermIds] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Data fetching
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useData<TeamMember[]>(
    `team-members-${id}`,
    () => teamsApi.getMembers(id),
    { transform: (res) => res.data! }
  );

  const { data: allUsers = [], isLoading: usersLoading } = useData(
    'users',
    () => usersApi.getUsers(),
    { transform: (res) => res.data ?? [] }
  );

  const { data: permData, isLoading: permsLoading } = useData(
    'access-permissions',
    () => accessApi.getPermissions(),
    { transform: (res) => res.data! }
  );

  const { data: teamPerms = [], refetch: refetchTeamPerms } = useData<Permission[]>(
    `team-perms-${id}`,
    () => teamsApi.getTeamPermissions(id),
    {
      transform: (res) => res.data ?? []
    }
  );

  // Sync teamPerms into assignedPermIds whenever the fetched data changes
  useEffect(() => {
    setAssignedPermIds(new Set(teamPerms.map((p) => p.id)));
    setHasChanges(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamPerms.length, teamPerms.map((p) => p.id).join(',')]);

  const memberUserIds = new Set(members.map((m) => m.userId));
  const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));

  const handleAddMember = async () => {
    if (!addUserId) return;
    setIsAdding(true);
    try {
      await teamsApi.addMember(id, addUserId);
      toast.success('Member added successfully');
      setAddUserId('');
      refetchMembers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await teamsApi.removeMember(id, userId);
      toast.success('Member removed');
      refetchMembers();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleTogglePerm = (permId: number, checked: boolean) => {
    setAssignedPermIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permId);
      else next.delete(permId);
      return next;
    });
    setHasChanges(true);
  };

  const handleSavePerms = async () => {
    setIsSaving(true);
    try {
      await teamsApi.syncTeamPermissions(id, Array.from(assignedPermIds));
      toast.success('Team permissions updated');
      setHasChanges(false);
      refetchTeamPerms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const grouped = permData?.grouped ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Detail"
        description="Manage team members and permissions."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {(['members', 'permissions'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'members' ? <Users className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Add Member (admin only) */}
          {isAdmin && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-muted/20">
              <Popover open={comboOpen} onOpenChange={setComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboOpen}
                    className="w-72 justify-between font-normal"
                    disabled={usersLoading}
                  >
                    {addUserId
                      ? (() => {
                          const u = nonMembers.find((u) => u.id === addUserId);
                          return u ? `${u.name} (${u.email})` : 'Select user...';
                        })()
                      : 'Search user to add...'}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search by name or email..." />
                    <CommandList className="max-h-60">
                      <CommandEmpty>No users found.</CommandEmpty>
                      <CommandGroup>
                        {nonMembers.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={`${u.name} ${u.email}`}
                            onSelect={() => {
                              setAddUserId(u.id);
                              setComboOpen(false);
                            }}
                            className="flex items-center gap-3 py-2"
                          >
                            <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                addUserId === u.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                        {nonMembers.length === 0 && (
                          <p className="py-4 text-center text-xs text-muted-foreground">All users are already members</p>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                onClick={handleAddMember}
                disabled={!addUserId || isAdding}
                className="gap-2"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add Member
              </Button>
            </div>
          )}

          <DataLoader isLoading={membersLoading} skeletonVariant="list" skeletonProps={{ rows: 4 }}>
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No members in this team yet.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={member.role === 'LEADER' ? 'default' : 'secondary'} className="text-xs">
                        {member.role}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setRemovingMemberId(member.userId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </DataLoader>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {!isAdmin && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              You can view but not modify team permissions.
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{assignedPermIds.size}</span> of{' '}
              <span className="font-semibold text-foreground">{permData?.permissions.length ?? 0}</span> permissions active for this team
            </p>
            {isAdmin && hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setAssignedPermIds(new Set(teamPerms.map((p) => p.id)));
                  setHasChanges(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSavePerms} disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>

          <DataLoader isLoading={permsLoading} skeletonVariant="list" skeletonProps={{ rows: 6 }}>
            <div className="space-y-4">
              {Object.entries(grouped).map(([module, perms]) => (
                <div key={module} className="rounded-xl border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border/50">
                    <Badge
                      variant="outline"
                      className={`capitalize text-[11px] ${MODULE_COLORS[module] ?? 'bg-muted text-muted-foreground'}`}
                    >
                      {module}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {perms.filter((p) => assignedPermIds.has(p.id)).length}/{perms.length}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={assignedPermIds.has(perm.id)}
                          onCheckedChange={(checked) => handleTogglePerm(perm.id, checked === true)}
                          disabled={!isAdmin}
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <code className="text-xs font-mono text-foreground">{perm.name}</code>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DataLoader>
        </div>
      )}

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removingMemberId} onOpenChange={() => setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the user from the team. They will lose all permissions granted by this team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
