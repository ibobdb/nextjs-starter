'use client';

import * as React from 'react';
import { CalendarDays } from 'lucide-react';
import { addDays } from 'date-fns';
import type { DateRange } from 'react-day-picker';

import { PageHeader } from '@/components/common/page-header';
import { DatePicker } from '@/components/common/date-picker';
import { DateRangePicker } from '@/components/common/date-range-picker';

export default function DatePickerDemoPage() {
  // Single date state
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Date range state
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Date Pickers"
        description="Standalone date and date range pickers for filters and forms, built on shadcn calendar."
        icon={CalendarDays}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Single Date Picker */}
        <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Single Date Picker</h3>
            <p className="text-sm text-muted-foreground">Used for selecting a specific day.</p>
          </div>
          
          <div className="space-y-2">
            <DatePicker
              date={date}
              onChange={setDate}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Selected: <code className="bg-muted px-1 py-0.5 rounded">{date?.toISOString() || 'None'}</code>
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="p-6 rounded-xl border border-border/50 bg-card space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Date Range Picker</h3>
            <p className="text-sm text-muted-foreground">Used for selecting a range (From - To).</p>
          </div>
          
          <div className="space-y-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
            <p className="text-xs text-muted-foreground mt-2">
              From: <code className="bg-muted px-1 py-0.5 rounded">{dateRange?.from?.toISOString() || 'None'}</code><br/>
              To: <code className="bg-muted px-1 py-0.5 rounded">{dateRange?.to?.toISOString() || 'None'}</code>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
