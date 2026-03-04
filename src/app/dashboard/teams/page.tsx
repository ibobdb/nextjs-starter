"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Users, 
  Plus, 
  Loader2,
  MoreVertical,
  Trash2,
  Pencil,
  Settings
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useData } from "@/hooks/use-data";
import { teamsApi, type Team } from "@/services/teams/api";

import { usePermission } from "@/lib/rbac/hooks/usePermission";
import { useSession } from "@/hooks/use-session";
import { PermissionAlert } from "@/components/common/permission-alert";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { DataLoader } from "@/components/common/data-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export default function TeamsPage() {
  const { user } = useSession();
  const { allowed: canWrite } = usePermission('team.write');
  const isSuperAdmin = user?.roles?.includes('super_admin');
  const hasWriteAccess = isSuperAdmin || canWrite;

  const { data: teamsObj, isLoading, mutate } = useData<Team[]>(
    "teams",
    () => teamsApi.getTeams()
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const teams = teamsObj || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;

    try {
      setIsSubmitting(true);
      const body = await teamsApi.createTeam(newTeam);
      if (!body.success) throw new Error(body.message || "Failed to create team");

      toast.success("Team created successfully");
      setIsCreateOpen(false);
      setNewTeam({ name: "", description: "" });
      mutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const body = await teamsApi.deleteTeam(deleteId);
      if (!body.success) throw new Error(body.message || "Failed to delete team");
      
      toast.success("Team deleted explicitly");
      mutate();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Team Management"
          description="Create and organize internal teams to manage project access."
        />
        {hasWriteAccess && (
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

        {!hasWriteAccess && (
          <PermissionAlert 
            message="You do not have permission to manage (create/delete) teams. Please contact an administrator for team management access."
          />
        )}

      {isLoading ? (
        <DataLoader isLoading={true} skeletonVariant="spinner" />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10 text-muted-foreground/30" />}
          title="No teams defined yet"
          description="Create your first team to start grouping your users."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col transition-all hover:shadow-md hover:border-border">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{team.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Created {format(new Date(team.createdAt), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2 cursor-pointer disabled opacity-50" disabled>
                       <Pencil className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeleteId(team.id)} 
                      className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      disabled={!hasWriteAccess}
                    >
                      <Trash2 className="h-4 w-4" /> Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground flex-1 mb-6">
                {team.description || <span className="italic opacity-50">No description provided</span>}
              </p>

              <div className="pt-4 border-t border-border/50 flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="bg-muted px-2 py-0.5 rounded-full">{team._count?.members || 0} members</span>
                </span>
                <Button variant="outline" size="sm" asChild className="gap-1.5 h-7 text-xs">
                  <Link href={`/dashboard/teams/${team.id}`}>
                    <Settings className="h-3.5 w-3.5" />
                    Manage
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Define a new team space. You can add members to it later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g. Content Creators"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="What is this team responsible for?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || !newTeam.name.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this team and remove all memebers from it. 
              The users themselves will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Team
             </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
