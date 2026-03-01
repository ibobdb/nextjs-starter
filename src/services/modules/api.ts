/**
 * services/modules/api.ts — Module Registry API client
 */

export interface AppModule {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateModuleDto {
  isActive?: boolean;
  status?: string;
}

async function handleRes<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Request failed');
  return json;
}

export const modulesApi = {
  getModules(): Promise<{ success: boolean; data: AppModule[] }> {
    return fetch('/api/modules').then(handleRes<{ success: boolean; data: AppModule[] }>);
  },

  updateModule(id: string, data: UpdateModuleDto): Promise<{ success: boolean; data: AppModule }> {
    return fetch(`/api/modules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleRes<{ success: boolean; data: AppModule }>);
  },
};
