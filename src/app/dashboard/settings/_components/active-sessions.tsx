'use client';

import { useState, useEffect } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Loader2, Monitor, Smartphone, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface BrowserSession {
  token: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  updatedAt: string | Date;
}

export function ActiveSessions() {
  const { data: sessionData } = useSession();
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const { data, error } = await authClient.listSessions();
      if (error) throw new Error(error.message);
      if (data) setSessions(data);
    } catch {
      toast.error('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (token: string) => {
    try {
      const { error } = await authClient.revokeSession({ token });
      if (error) throw new Error(error.message);
      toast.success('Session revoked successfully');
      fetchSessions();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke session');
    }
  };

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>;
  if (!sessions.length) return <div className="p-4 text-center text-sm text-muted-foreground">No active sessions found.</div>;

  return (
    <div className="space-y-4">
      {sessions.map((s) => (
        <div key={s.token} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-4">
            {s.userAgent?.toLowerCase().includes('mobile') ? (
              <Smartphone className="h-5 w-5 text-muted-foreground shrink-0" />
            ) : (
              <Monitor className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-sm flex items-center gap-2 truncate">
                {s.userAgent?.split(' ')[0] || 'Unknown Browser'}
                {sessionData?.session?.token === s.token && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">Current</Badge>
                )}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                IP: {s.ipAddress || 'Unknown'} • Last active: {new Date(s.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {sessionData?.session?.token !== s.token && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:bg-destructive/10 shrink-0" 
              onClick={() => handleRevoke(s.token)}
              title="Revoke Session"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
