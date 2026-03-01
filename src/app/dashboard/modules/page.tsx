'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { useModules } from '@/hooks/use-modules';
import { modulesApi } from '@/services/modules/api';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Blocks, Loader2 } from 'lucide-react';
import { DataLoader } from '@/components/common/data-loader';

export default function ModulesRegistryPage() {
  const { modules, isLoading, error, mutate } = useModules();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const newStatus = !currentStatus;

      const res = await modulesApi.updateModule(id, { isActive: newStatus });
      if (res.success) {
        toast.success(`Modul berhasil di${newStatus ? 'aktifkan' : 'nonaktifkan'}!`);
        mutate(); // Re-fetch confirm
      }
    } catch (err: any) {
      toast.error('Gagal mengupdate modul', { description: err.message });
      mutate(); // Re-fetch untuk amannya
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modules Registry"
        description="Pusat kendali ketersediaan fitur dan modul DBStudio. Mematikan modul akan menghalanginya tampil di navigasi."
      />

      <div className="pt-2">
        <DataLoader 
          isLoading={isLoading} 
          error={error} 
          onRetry={mutate} 
          isEmpty={modules.length === 0} 
          emptyIcon={<Blocks className="h-10 w-10 text-muted-foreground/50"/>} 
          emptyTitle="Belum ada Modul Terdaftar" 
          emptyDescription="Anda belum memiliki instalasi modul pada server ini."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <Card key={mod.id} className={!mod.isActive ? 'opacity-75 border-dashed bg-muted/30' : ''}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <span className="truncate">{mod.name}</span>
                      {!mod.isActive && <Badge variant="secondary" className="text-[10px] uppercase h-5 shrink-0 px-1.5">Disabled</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono">{mod.id}</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {togglingId === mod.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-1" />
                    )}
                    <Switch 
                      disabled={togglingId === mod.id}
                      checked={mod.isActive} 
                      onCheckedChange={() => handleToggle(mod.id, mod.isActive)} 
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80 min-h-[40px]">
                    {mod.description || 'Tidak ada deskripsi untuk modul ini.'}
                  </p>
                  
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs font-medium text-muted-foreground">Internal Status</span>
                    <Badge variant={mod.status === 'ONLINE' ? 'default' : 'destructive'} className="h-5 text-[10px] uppercase">
                      {mod.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DataLoader>
      </div>
    </div>
  );
}
