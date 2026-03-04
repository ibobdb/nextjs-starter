import * as React from 'react';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export interface FormInputProps<T extends FieldValues> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'form' | 'name'> {
  name: Path<T>;
  form: UseFormReturn<T>;
  label?: string;
  description?: string;
}

/**
 * FormInput — A wrapper around shadcn Form & Input (DBStudio Base)
 *
 * Eliminates FormField/FormItem/FormControl boilerplate for simple text inputs.
 */
export function FormInput<T extends FieldValues>({
  name,
  form,
  label,
  description,
  className,
  type = 'text',
  ...props
}: FormInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input type={type} {...field} {...props} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
