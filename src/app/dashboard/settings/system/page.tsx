import { PageHeader } from '@/components/common/page-header';
import { SettingsForm } from './components/settings-form';

export const metadata = {
  title: 'System Configuration',
};

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-2">
      <PageHeader 
        title="System Configuration" 
        description="Manage dynamic application settings, identity, and email configurations." 
      />
      <SettingsForm />
    </div>
  );
}
