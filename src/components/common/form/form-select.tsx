import * as React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  form: UseFormReturn<T>;
  label?: string;
  description?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  disabled?: boolean;
}

/**
 * FormSelect — A wrapper around shadcn Form & Select (DBStudio Base)
 *
 * Eliminates FormField/FormItem/FormControl boilerplate for simple dropdowns.
 */
export function FormSelect<T extends FieldValues>({
  name,
  form,
  label,
  description,
  options,
  placeholder = 'Select an option...',
  disabled,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
