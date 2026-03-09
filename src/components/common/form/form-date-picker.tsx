import * as React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { DatePicker } from '@/components/common/date-picker';

export interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Earliest month to show in the dropdown */
  startMonth?: Date;
  /** Latest month to show in the dropdown */
  endMonth?: Date;
}

/**
 * FormDatePicker — A wrapper around shadcn Form & DatePicker (DBStudio Base)
 *
 * Eliminates FormField boilerplate for picking a single date.
 */
export function FormDatePicker<T extends FieldValues>({
  name,
  form,
  label,
  description,
  placeholder,
  disabled,
  startMonth,
  endMonth,
}: FormDatePickerProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <DatePicker
              date={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
