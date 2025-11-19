import { Button } from '@/components/ui/button';
import { Can } from '@/lib/rbac/components/can';
export default function TestPage() {
  return (
    <div className="flex justify-center gap-4">
      <Can permission="user.read">
        <Button variant={'default'}>Hanya bisa di lihat super admin</Button>
      </Can>
      <Button variant={'ghost'}>Bisa dilihat semua user</Button>
    </div>
  );
}
