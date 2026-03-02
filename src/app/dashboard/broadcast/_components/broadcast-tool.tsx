'use client';

import { useState } from 'react';
import { 
  Megaphone, 
  Send, 
  Loader2, 
  Users, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

import { useData } from '@/hooks/use-data';
import { accessApi, type Role } from '@/services/access/api';
import { notificationsApi } from '@/services/notifications/api';

export function BroadcastTool() {
  const [loading, setLoading] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  
  const { data } = useData<Role[]>(
    'access-roles',
    () => accessApi.getRoles()
  );
  const roles = data || [];

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO',
    actionUrl: '',
  });



  const handleToggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId) 
        : [...prev, roleId]
    );
  };

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }

    setLoading(true);
    try {
      const res = await notificationsApi.sendBroadcast({
        ...formData,
        roleIds: selectedRoleIds
      });

      if (res.success) {
        toast.success(`Broadcast sent successfully to ${res.data?.count || 0} users!`);
        setFormData({
          title: '',
          message: '',
          type: 'INFO',
          actionUrl: '',
        });
        setSelectedRoleIds([]);
      } else {
        toast.error(`Failed to send broadcast: ${res.message}`);
      }
    } catch (err) {
      toast.error('Failed to send broadcast due to a network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border bg-muted/20">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> System Broadcast Center
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Send manual notifications to all users or specific user roles.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Title</label>
              <Input 
                placeholder="e.g. System Maintenance" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Type</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  { value: 'INFO', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { value: 'SUCCESS', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                  { value: 'WARNING', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                  { value: 'ERROR', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                      formData.type === type.value 
                        ? cn("border-primary ring-1 ring-primary", type.bg) 
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <type.icon className={cn("h-4 w-4", type.color)} />
                    <span className="text-[10px] font-bold uppercase">{type.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Action URL (Optional)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="https://dbstudio.com/updates" 
                  className="pl-9"
                  value={formData.actionUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notification Message</label>
              <Textarea 
                placeholder="Compose your system-wide alert here..." 
                className="min-h-[120px] resize-none"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Target Roles</span>
                <span className="text-[10px] font-normal normal-case italic text-muted-foreground">Leave empty to target ALL users</span>
              </label>
              <div className="p-3 rounded-xl border border-border bg-muted/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.length === 0 ? (
                  <div className="col-span-2 py-4 flex flex-col items-center justify-center text-muted-foreground/40 italic text-xs">
                    <Loader2 className="h-4 w-4 animate-spin mb-1" />
                    Loading roles...
                  </div>
                ) : (
                  roles.map((role: Role) => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`role-${role.id}`} 
                        checked={selectedRoleIds.includes(role.id)}
                        onCheckedChange={() => handleToggleRole(role.id)}
                      />
                      <label 
                        htmlFor={`role-${role.id}`}
                        className="text-xs font-medium leading-none cursor-pointer select-none truncate"
                      >
                        {role.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>Target: <span className="font-bold text-foreground">{selectedRoleIds.length > 0 ? `${selectedRoleIds.length} roles` : 'All Users'}</span></span>
          </div>
          <Button 
            onClick={handleSend} 
            disabled={loading || !formData.title || !formData.message}
            className="px-8 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Broadcast Now
          </Button>
        </div>
      </div>
    </div>
  );
}
