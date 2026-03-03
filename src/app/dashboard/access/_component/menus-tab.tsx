'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical, 
  Shield
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { 
  accessApi, 
  Menu, 
  MenuInput,
  Role, 
  Permission 
} from '@/services/access/api';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { usePermission } from '@/lib/rbac/hooks/usePermission';
import { useSession } from '@/hooks/use-session';
import { PermissionAlert } from '@/components/common/permission-alert';

function SortableMenuItem({ 
  menu, 
  onEdit, 
  onDelete, 
  isChild = false,
  disabledActions = false
}: { 
  menu: Menu; 
  onEdit: (menu: Menu) => void; 
  onDelete: (id: number) => void;
  isChild?: boolean;
  disabledActions?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: menu.id, disabled: disabledActions });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors ${isChild ? 'ml-8' : 'mb-2'}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className={`cursor-grab text-muted-foreground hover:text-foreground ${disabledActions ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{menu.title}</span>
            {menu.url && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">{menu.url}</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {menu.roles.map(r => (
              <Badge key={r.role.id} variant="outline" className="text-[9px] px-1 py-0 h-3.5 opacity-70">
                {r.role.name}
              </Badge>
            ))}
            {menu.permission && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                {menu.permission.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-primary" 
          onClick={() => onEdit(menu)}
          disabled={disabledActions}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive" 
          onClick={() => onDelete(menu.id)}
          disabled={disabledActions}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// --- Main Tab Component ---

export function MenusTab() {
  const { user } = useSession();
  const { allowed: canManage } = usePermission('admin.manage');
  const isSuperAdmin = user?.roles?.includes('super_admin');
  const hasManageAccess = isSuperAdmin || canManage;

  const { mutate } = useSWRConfig();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    url: '',
    icon: '',
    order: 0,
    parentId: '',
    permissionId: '',
    roles: [] as number[],
  });

  // Fetch data with SWR
  const { data: menus, mutate: mutateMenus, isLoading: isMenusLoading } = useSWR<Menu[]>('/api/menus/admin', () => accessApi.getMenus());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        accessApi.getRoles(),
        accessApi.getPermissions(),
      ]);
      setRoles(rolesData.data);
      setPermissions(permsData.data.permissions);
    } catch {
      toast.error('Failed to load roles/permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = (parentId?: number) => {
    setEditingMenu(null);
    setFormData({
      id: 0,
      title: '',
      url: '',
      icon: '',
      order: 0,
      parentId: parentId?.toString() || '',
      permissionId: '',
      roles: [],
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      id: menu.id,
      title: menu.title,
      url: menu.url || '',
      icon: menu.icon || '',
      order: menu.order,
      parentId: menu.parentId?.toString() || '',
      permissionId: menu.permissionId?.toString() || '',
      roles: menu.roles.map(r => r.role.id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await accessApi.deleteMenu(id);
      toast.success('Menu deleted');
      mutate('/api/menus');
      mutateMenus();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete menu');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: MenuInput = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        permissionId: (formData.permissionId && formData.permissionId !== 'none_perm') ? parseInt(formData.permissionId) : null,
      };

      if (editingMenu) {
        await accessApi.updateMenu(payload);
        toast.success('Menu updated');
      } else {
        await accessApi.createMenu(payload);
        toast.success('Menu created');
      }
      setIsDialogOpen(false);
      mutate('/api/menus');
      mutateMenus();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save menu');
    }
  };

  const handleRoleToggle = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(id => id !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && menus) {
      const oldIndex = menus.findIndex(i => i.id === active.id);
      const newIndex = menus.findIndex(i => i.id === over.id);
      const newItems = arrayMove(menus, oldIndex, newIndex);
      
      newItems.forEach((item: Menu, index: number) => {
        const updatePayload: MenuInput = {
          ...item,
          order: index,
          roles: item.roles.map(r => r.role.id)
        };
        accessApi.updateMenu(updatePayload);
      });
      
      mutate('/api/menus');
      mutateMenus(newItems, false);
    }
  };

  if (isLoading || isMenusLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading menu configuration...</div>;
  }

  return (
    <Card className="border-none shadow-none bg-transparent">
      {!hasManageAccess && (
        <PermissionAlert 
          message="You do not have permission to manage the navigation menu structure. Please contact an administrator for menu management access."
        />
      )}
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-between items-end">
          <div>
            <CardTitle>Menu Navigation</CardTitle>
            <CardDescription>Dynamically manage the dashboard sidebar structure based on roles and permissions.</CardDescription>
          </div>
          {hasManageAccess && (
            <Button onClick={() => handleOpenAdd()} size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={menus?.map(m => m.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {menus?.map((group) => (
              <div key={group.id} className="mb-6">
                <div className="flex items-center gap-2 mb-2 group">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 cursor-default px-2 py-0.5 uppercase tracking-wider text-[10px] font-bold">
                    {group.title}
                  </Badge>
                  {hasManageAccess && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(group)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenAdd(group.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(group.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {group.children?.map(item => (
                    <SortableMenuItem 
                      key={item.id} 
                      menu={item} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete}
                      isChild={true}
                      disabledActions={!hasManageAccess}
                    />
                  ))}
                  {(!group.children || group.children.length === 0) && (
                    <div className="ml-8 p-3 border border-dashed rounded-lg text-xs text-muted-foreground text-center">
                      No items in this group.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingMenu ? 'Edit Menu' : 'Add Menu'}</DialogTitle>
              <DialogDescription>
                {formData.parentId ? 'Adding item to a group.' : 'Adding a new navigation group.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="col-span-3" 
                  placeholder="e.g. Analytics"
                  required
                />
              </div>

              {formData.parentId && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">URL</Label>
                    <Input 
                      id="url" 
                      value={formData.url} 
                      onChange={e => setFormData({...formData, url: e.target.value})}
                      className="col-span-3" 
                      placeholder="/dashboard/analytics"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="icon" className="text-right">Icon</Label>
                    <Input 
                      id="icon" 
                      value={formData.icon} 
                      onChange={e => setFormData({...formData, icon: e.target.value})}
                      className="col-span-3" 
                      placeholder="BarChart (Lucide Name)"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="permission" className="text-right">Permission</Label>
                <div className="col-span-3">
                  <Select 
                    value={formData.permissionId} 
                    onValueChange={val => setFormData({...formData, permissionId: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select required permission (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none_perm">None (Open to authorized roles)</SelectItem>
                      {permissions.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right mt-2">Roles</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2 border rounded-md p-3 max-h-[150px] overflow-y-auto">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`role-${role.id}`} 
                        checked={formData.roles.includes(role.id)}
                        onCheckedChange={() => handleRoleToggle(role.id)}
                      />
                      <label htmlFor={`role-${role.id}`} className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingMenu ? 'Save Changes' : 'Create Menu'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
