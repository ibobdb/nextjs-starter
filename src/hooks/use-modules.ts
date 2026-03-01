'use client';

/**
 * hooks/use-modules.ts — Global SWR hook for Module Registry
 *
 * Mengambil daftar status modul (aktif atau mati) agar bisa dikonsumsi oleh UI komponen seperti Sidebar.
 */

import { useData } from './use-data';
import { modulesApi, AppModule } from '@/services/modules/api';
import { useMemo } from 'react';

export function useModules() {
  const { data: modules, isLoading, error, mutate } = useData<AppModule[]>(
    'global-modules',
    () => modulesApi.getModules(),
    {
      revalidateOnFocus: true, 
      refreshInterval: 60000, // Cek status modul setiap 1 menit di background
    }
  );

  // Helper untuk mengecek apakah suatu modul aktif berdasarkan id.
  const isModuleActive = useMemo(() => {
    return (moduleId: string): boolean => {
      // Jika masih loading atau error, asumsikan aktif agar tidak nge-flicker UI labelnya.
      if (!modules || isLoading) return true;
      
      const target = modules.find((m) => m.id === moduleId);
      if (!target) return true; // Default behavior jika modul tak dicatatkan di db
      
      return target.isActive;
    };
  }, [modules, isLoading]);

  const getModuleRecord = useMemo(() => {
    return (moduleId: string): AppModule | undefined => {
      if (!modules) return undefined;
      return modules.find((m) => m.id === moduleId);
    };
  }, [modules]);

  return {
    modules: modules || [],
    isLoading,
    error,
    mutate,
    isModuleActive,
    getModuleRecord,
  };
}
