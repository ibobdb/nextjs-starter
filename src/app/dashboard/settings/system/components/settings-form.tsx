'use client';

import { useState, useEffect } from 'react';
import { useData } from '@/hooks/use-data';
import { settingsApi, SystemConfigItem } from '@/services/settings/api';
import { DataLoader } from '@/components/common/data-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Save, Mail, AppWindow } from 'lucide-react';
import { toast } from 'sonner';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useSession } from '@/hooks/use-session';
import { PermissionAlert } from '@/components/common/permission-alert';

export function SettingsForm() {
  const { user } = useSession();
  const { allowed: canUpdate } = usePermission('settings.update');
  const isSuperAdmin = user?.roles?.includes('super_admin');
  const hasUpdateAccess = isSuperAdmin || canUpdate;

  const { data, isLoading, mutate } = useData<SystemConfigItem[]>(
    'system-settings',
    () => settingsApi.getSettings()
  );

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      const initialData: Record<string, string> = {};
      data.forEach(item => {
        initialData[item.key] = item.value;
      });
      setFormData(initialData);
    }
  }, [data]);

  const handleSave = async () => {
    if (!hasUpdateAccess) {
      toast.error('You do not have permission to update settings');
      return;
    }
    setIsSaving(true);
    try {
      const payload = Object.entries(formData).map(([key, value]) => ({ key, value }));
      const res = await settingsApi.updateSettings(payload);
      if (res.success) {
        toast.success(res.message || 'Settings updated successfully');
        mutate();
      } else {
        toast.error(res.error || 'Failed to update settings');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const getFormGroup = (keys: string[], title: string, description: string, Icon: React.ComponentType<{ size?: number; className?: string }>) => {
    if (!data) return null;
    const items = data.filter(d => keys.includes(d.key));
    if (items.length === 0) return null;

    return (
      <Card className="mb-6 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map(item => (
            <div key={item.key} className="space-y-2">
              <Label htmlFor={item.key} className="font-semibold">{item.description || item.key}</Label>
              <div className="relative">
                <Input
                  id={item.key}
                  type={item.isSecret && !showSecrets[item.key] ? 'password' : 'text'}
                  value={formData[item.key] || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, [item.key]: e.target.value }))}
                  placeholder={item.isSecret ? '********' : ''}
                  className="bg-background"
                  disabled={!hasUpdateAccess}
                />
                {item.isSecret && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showSecrets[item.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <DataLoader isLoading={true} />;
  }

  return (
    <div className="space-y-6">
      {!hasUpdateAccess && (
        <PermissionAlert 
          message="Anda tidak memiliki izin untuk mengubah konfigurasi sistem. Silakan hubungi administrator jika Anda memerlukan akses update."
        />
      )}

      {getFormGroup(['APP_NAME', 'APP_DESCRIPTION', 'COMPANY_NAME', 'APP_URL', 'LOGO_URL'], 'Application Identity', 'Manage application name, branding elements, and primary URLs.', AppWindow)}
      {getFormGroup(['EMAIL_FROM', 'SUPPORT_EMAIL', 'RESEND_API_KEY'], 'Email Configuration', 'Manage email delivery settings, contact addresses, and API integrations.', Mail)}

      {hasUpdateAccess && (
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 px-8">
            {isSaving ? <span className="animate-spin text-lg">↻</span> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
