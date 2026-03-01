"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, User, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  if (isPending) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return null; // Let the layout/middleware handle redirect
  }

  const { user } = session;
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U";

  // Note: better-auth `user.roles` and `user.permissions` are typed or populated based on plugins
  const roles: string[] = (user as any).roles || [];
  const permissions: string[] = (user as any).permissions || [];

  const handleUpdateProfile = async () => {
    if (!name.trim() || name === user.name) return;
    setIsSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      });
      if (error) throw new Error(error.message || "Failed to update profile");
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2">
      <PageHeader
        title="Account Settings"
        description="Manage your profile information and security preferences."
      />

      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              Your personal information displayed across the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 border-2 border-border/50">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  {roles.map((r, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {r.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user.email} disabled />
                <p className="text-xs text-muted-foreground">Email change is currently unsupported.</p>
              </div>
            </div>

            {name !== user.name && (
              <div className="flex justify-end pt-2">
                <Button onClick={handleUpdateProfile} disabled={isSaving || !name.trim()} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & Access Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Security & Access
            </CardTitle>
            <CardDescription>
              Your current session and authorization levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Active Permissions</Label>
              {permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {permissions.map((p, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs text-muted-foreground">
                      {p}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No specific permissions granted outside of role.</p>
              )}
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <Label>Current Session</Label>
              <div className="bg-muted/30 p-4 rounded-md border border-border/40 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP Address</span>
                  <span className="font-mono">{session.session.ipAddress || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User Agent</span>
                  <span className="font-mono truncate max-w-[200px] sm:max-w-md" title={session.session.userAgent || ""}>
                    {session.session.userAgent || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires At</span>
                  <span className="font-mono">{new Date(session.session.expiresAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
