'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (date?: DateRange) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: 'center' | 'start' | 'end';
  isCompact?: boolean;
  /** Earliest month to show in the dropdown */
  startMonth?: Date;
  /** Latest month to show in the dropdown */
  endMonth?: Date;
}

/**
 * DateRangePicker — Reusable date range picker (DBStudio Base)
 *
 * Built on top of shadcn Popover + Calendar (range mode)
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  className,
  disabled,
  align = 'start',
  isCompact = false,
  startMonth = new Date(1900, 0),
  endMonth = new Date(2100, 11),
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Independent states for the left and right calendar views
  const [leftMonth, setLeftMonth] = React.useState<Date>(value?.from || new Date());
  const [rightMonth, setRightMonth] = React.useState<Date>(
    value?.to || new Date(new Date().setMonth(new Date().getMonth() + 1))
  );

  // Keep month state in sync if value is updated from outside
  React.useEffect(() => {
    if (value?.from) {
      setLeftMonth(value.from);
      if (value.to && value.to.getMonth() !== value.from.getMonth()) {
        setRightMonth(value.to);
      } else {
        setRightMonth(new Date(new Date(value.from).setMonth(value.from.getMonth() + 1)));
      }
    }
  }, [value?.from, value?.to]);

  // Format date based on compact mode
  const formatDate = (date: Date) => {
    return isCompact ? format(date, 'MM/dd/yy') : format(date, 'LLL dd, y');
  };

  // Get display text for date range
  const getDateRangeText = () => {
    if (!value?.from) return <span>{placeholder}</span>;

    if (!value.to) return formatDate(value.from);

    return (
      <>
        {formatDate(value.from)} - {formatDate(value.to)}
      </>
    );
  };

  // Apply date preset
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    let range: DateRange;

    switch (preset) {
      case 'today':
        range = {
          from: startOfDay(today),
          to: endOfDay(today),
        };
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        range = {
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        };
        break;
      case 'last7days':
        range = {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today),
        };
        break;
      case 'last30days':
        range = {
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today),
        };
        break;
      case 'thisWeek':
        range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        };
        break;
      case 'thisMonth':
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
        break;
      case 'thisYear':
        range = {
          from: startOfYear(today),
          to: endOfYear(today),
        };
        break;
      default:
        range = {
          from: subDays(today, 7),
          to: today,
        };
    }

    if (onChange) {
      onChange(range);
    }
    
    if (range.from) {
      setLeftMonth(range.from);
      if (range.to) {
        setRightMonth(range.to.getMonth() === range.from.getMonth() 
          ? new Date(new Date(range.from).setMonth(range.from.getMonth() + 1)) 
          : range.to);
      }
    }
    setIsOpen(false);     // Close the popup after selecting a preset
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              value && 'border-primary text-primary'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{getDateRangeText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align={align}>
          <div className="flex gap-2 p-3">
            <Calendar
              initialFocus
              mode="range"
              month={leftMonth}
              onMonthChange={setLeftMonth}
              selected={value}
              onSelect={onChange}
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
            />
            <div className="hidden md:block">
              <Calendar
                mode="range"
                month={rightMonth}
                onMonthChange={setRightMonth}
                selected={value}
                onSelect={onChange}
                captionLayout="dropdown"
                startMonth={startMonth}
                endMonth={endMonth}
              />
            </div>
          </div>

          {/* Date range presets */}
          <div className="border-l p-3 space-y-2 min-w-[130px]">
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('today')} className="justify-start text-xs">
                today
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('yesterday')} className="justify-start text-xs">
              yesterday
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('last7days')} className="justify-start text-xs">
              last7days
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('last30days')} className="justify-start text-xs">
          last30days
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('thisWeek')} className="justify-start text-xs">
                thisWeek
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('thisMonth')} className="justify-start text-xs">
              thisMonth
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyDatePreset('thisYear')} className="justify-start text-xs">
              thisYear
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
