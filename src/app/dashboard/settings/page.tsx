'use client';

import { useEffect, useState, useCallback } from 'react';
import { configApi } from '@/services/ts-worker/api/config';
import { SystemConfig } from '@/services/ts-worker/types';
import { toast } from 'sonner';
import { RefreshCw, Save, Trash2, Settings2, Info, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.getConfig();
      if (res.success && res.data) {
        setConfig(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast.error('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await configApi.updateConfig(config);
      if (res.success) {
        toast.success('Configuration updated successfully');
      }
    } catch (error) {
      console.error('Failed to update config:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const res = await configApi.clearCache();
      if (res.success) {
        toast.success('System cache cleared');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure global parameters for the TrendScout Worker.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCache}
                className="gap-2 border-border/50 bg-background/50"
            >
                <Trash2 className="h-4 w-4" />
                Clear Cache
            </Button>
            <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={saving}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
                <Save className={`h-4 w-4 ${saving ? 'animate-pulse' : ''}`} />
                Save Changes
            </Button>
        </div>
      </div>

      <Alert className="border-primary/20 bg-primary/5 text-primary">
        <Info className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
           Be careful while editing these parameters as they directly affect the AI&apos;s clustering and discovery logic.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
               <Settings2 className="h-5 w-5 text-primary" />
               <CardTitle>Discovery Engine</CardTitle>
            </div>
            <CardDescription>Adjust the temporal lookback and scoring sensitivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="LOOKBACK_DAYS">Lookback Days</Label>
                <Input 
                  id="LOOKBACK_DAYS" 
                  type="number" 
                  value={config.LOOKBACK_DAYS || ''} 
                  onChange={(e) => handleUpdate('LOOKBACK_DAYS', e.target.value)}
                  className="bg-muted/20 border-border/50"
                />
                <p className="text-xs text-muted-foreground">How many days back the engine analyzes data for new trends.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="MIN_SCORE">Minimum Discovery Score</Label>
                <Input 
                  id="MIN_SCORE" 
                  type="number" 
                  step="0.1"
                  value={config.MIN_SCORE || ''} 
                  onChange={(e) => handleUpdate('MIN_SCORE', e.target.value)}
                  className="bg-muted/20 border-border/50"
                />
                <p className="text-xs text-muted-foreground">The threshold for a keyword cluster to be considered a discovery candidate.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader>
             <div className="flex items-center gap-2">
               <Database className="h-5 w-5 text-primary" />
               <CardTitle>Pipeline Config</CardTitle>
            </div>
            <CardDescription>Deep system parameters for raw data processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid gap-4 md:grid-cols-2">
               {Object.entries(config).filter(([key]) => key !== 'LOOKBACK_DAYS' && key !== 'MIN_SCORE').map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{key.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}</Label>
                    <Input 
                      id={key} 
                      value={value} 
                      onChange={(e) => handleUpdate(key, e.target.value)}
                      className="bg-muted/20 border-border/50"
                    />
                  </div>
               ))}
               {Object.keys(config).filter((key) => key !== 'LOOKBACK_DAYS' && key !== 'MIN_SCORE').length === 0 && (
                  <div className="md:col-span-2 py-8 text-center text-muted-foreground italic border border-dashed rounded-lg bg-muted/5">
                    No additional parameters found.
                  </div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
