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
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
