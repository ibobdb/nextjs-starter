'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ClipboardList, Save } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';

// Import our custom Smart Form wrappers
import { FormInput } from '@/components/common/form/form-input';
import { FormSelect } from '@/components/common/form/form-select';
import { FormDatePicker } from '@/components/common/form/form-date-picker';

// ─── Schema Definition ──────────────────────────────────────────────────────

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  department: z.string().min(1, 'Please select a department.'),
  role: z.string().min(1, 'Please select a role.'),
  joinDate: z.date(),
  salary: z.coerce.number().min(1000, 'Salary must be at least 1000.'),
});

type FormValues = {
  fullName: string;
  email: string;
  department: string;
  role: string;
  joinDate: Date;
  salary: number;
};

// ─── Demo Data Options ──────────────────────────────────────────────────────

const DEPARTMENTS = [
  { label: 'Engineering', value: 'eng' },
  { label: 'Marketing', value: 'mkt' },
  { label: 'Human Resources', value: 'hr' },
  { label: 'Finance', value: 'fin' },
];

const ROLES = [
  { label: 'Manager', value: 'mgr' },
  { label: 'Team Lead', value: 'lead' },
  { label: 'Senior Staff', value: 'senior' },
  { label: 'Junior Staff', value: 'junior' },
];

// ─── Page Implementation ────────────────────────────────────────────────────

export default function FormsDemoPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [lastSubmitted, setLastSubmitted] = React.useState<FormValues | null>(null);

  // 1. Initialize the form with React Hook Form + Zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      department: '',
      role: '',
      // @ts-ignore: Next.js/React Hook Form default date issue
      joinDate: undefined,
      salary: 0,
    },
  });

  // 2. Form submission handler
  async function onSubmit(data: any) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    setLastSubmitted(data);
    toast.success('Employee registered successfully!');
    form.reset();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Smart Forms"
        description="Highly reusable form wrapper components combining react-hook-form, Zod validation, and shadcn/ui."
        icon={ClipboardList}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: The Form */}
        <div className="p-6 rounded-xl border border-border/50 bg-card">
          <h3 className="font-semibold text-lg mb-4">Register New Employee</h3>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormInput
                form={form as any}
                name="fullName"
                label="Full Name"
                placeholder="e.g. John Doe"
                description="Enter the employee's official name."
              />

              <FormInput
                form={form as any}
                name="email"
                type="email"
                label="Work Email"
                placeholder="john.doe@company.com"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  form={form as any}
                  name="department"
                  label="Department"
                  options={DEPARTMENTS}
                />
                <FormSelect
                  form={form as any}
                  name="role"
                  label="Role"
                  options={ROLES}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDatePicker
                  form={form as any}
                  name="joinDate"
                  label="Joining Date"
                  placeholder="Select a date"
                />
                <FormInput
                  form={form as any}
                  name="salary"
                  type="number"
                  label="Annual Salary ($)"
                  placeholder="e.g. 60000"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Employee
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Right Column: Information & Results */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
            <h4 className="font-medium text-blue-600 dark:text-blue-400">Why use these wrappers?</h4>
            <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-4">
              <li><strong>Zero Boilerplate:</strong> No need to write <code className="text-xs bg-muted px-1 py-0.5 rounded">FormField</code>, <code className="text-xs bg-muted px-1 py-0.5 rounded">FormItem</code>, etc., manually every time.</li>
              <li><strong>Auto Validation:</strong> Zod error messages automatically appear under the specific field in red.</li>
              <li><strong>Type Safe:</strong> Fully typed with your Zod schema via <code className="text-xs bg-muted px-1 py-0.5 rounded">form</code> prop.</li>
            </ul>
          </div>

          {lastSubmitted && (
            <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in slide-in-from-bottom-2">
              <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-2">Latest Submission</h4>
              <pre className="text-[11px] font-mono bg-background border border-border p-3 rounded-md overflow-auto">
                {JSON.stringify(lastSubmitted, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
