'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

// ─── Client Mode Props ──────────────────────────────────────────────────────

interface ClientComboboxProps {
  mode: 'client';
  /** Static list of options to display and filter */
  options: ComboboxOption[];
}

// ─── Server Mode Props ──────────────────────────────────────────────────────

interface ServerComboboxProps {
  mode: 'server';
  /** Async function called when search text changes (debounced by 300ms) */
  fetcher: (query: string) => Promise<ComboboxOption[]>;
  /** Optional fallback options shown before user types anything */
  defaultOptions?: ComboboxOption[];
}

// ─── Shared Base Props ──────────────────────────────────────────────────────

interface BaseComboboxProps {
  /** The currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Placeholder for the trigger button */
  placeholder?: string;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Text shown when no results match */
  emptyText?: string;
  /** Text shown while fetching (server mode only) */
  loadingText?: string;
  /** Disable the entire combobox */
  disabled?: boolean;
  /** Allow clearing the selection with an X button */
  allowClear?: boolean;
  className?: string;
  /** Optional width for the popover (e.g. "w-[300px]"). Defaults to the trigger width. */
  popoverWidth?: string;
}

export type SearchableComboBoxProps = BaseComboboxProps &
  (ClientComboboxProps | ServerComboboxProps);

/**
 * SearchableComboBox — Reusable searchable select component (DBStudio Base)
 *
 * Supports two modes:
 * - `client`: Natively filters a provided static `options` array via memory.
 * - `server`: Calls an async `fetcher` function as the user types (debounced).
 *
 * @example Client Mode
 * <SearchableComboBox
 *   mode="client"
 *   options={[{ value: '1', label: 'Admin' }]}
 *   value={roleId}
 *   onChange={setRoleId}
 * />
 *
 * @example Server Mode
 * <SearchableComboBox
 *   mode="server"
 *   fetcher={api.searchUsers}
 *   value={userId}
 *   onChange={setUserId}
 * />
 */
export function SearchableComboBox(props: SearchableComboBoxProps) {
  const {
    mode,
    value,
    onChange,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search...',
    emptyText = 'No basic results found.',
    loadingText = 'Loading...',
    disabled = false,
    allowClear = false,
    className,
    popoverWidth,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Server state
  const [serverOptions, setServerOptions] = React.useState<ComboboxOption[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);

  // Reset search when closing
  React.useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // Server fetch logic
  React.useEffect(() => {
    if (mode === 'server') {
      let isMounted = true;

      const runFetcher = async () => {
        setIsFetching(true);
        try {
          const results = await props.fetcher(debouncedSearch);
          if (isMounted) setServerOptions(results);
        } catch (error) {
          console.error('[SearchableComboBox] Fetch error:', error);
          if (isMounted) setServerOptions([]);
        } finally {
          if (isMounted) setIsFetching(false);
        }
      };

      if (debouncedSearch || !props.defaultOptions) {
        runFetcher();
      } else {
        setServerOptions(props.defaultOptions || []);
      }

      return () => {
        isMounted = false;
      };
    }
  }, [debouncedSearch, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Determine current active options
  const activeOptions = mode === 'client' ? props.options : serverOptions;
  
  // Try to find the selected option's label
  const selectedOptionInfo = React.useMemo(() => {
    // If we have options loaded that contain it, use that
    const found = activeOptions.find((opt) => opt.value === value);
    if (found) return found;
    
    // In server mode, if we have a value but it's not in the current search results,
    // we might need to display just the value or a cached label if we had one.
    // For simplicity, we just return the value as label if not found.
    return value ? { value, label: value } : null;
  }, [value, activeOptions]);

  // Handle command value changes
  const handleSelect = React.useCallback(
    (currentValue: string) => {
      // Find exact match from options to ensure exact casing
      // Note: cmdk lowercases the values internally for selection
      const matchedOption = activeOptions.find(
        (opt) => opt.value.toLowerCase() === currentValue.toLowerCase()
      );
      
      if (matchedOption) {
        onChange(matchedOption.value === value && allowClear ? '' : matchedOption.value);
      }
      setOpen(false);
    },
    [activeOptions, value, onChange, allowClear]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between font-normal', className)}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedOptionInfo?.icon && (
              <span className="shrink-0 text-muted-foreground">{selectedOptionInfo.icon}</span>
            )}
            <span className="truncate">
              {selectedOptionInfo ? selectedOptionInfo.label : placeholder}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {allowClear && value && !disabled && (
              <div
                role="button"
                tabIndex={0}
                className="h-4 w-4 rounded-sm hover:bg-muted flex items-center justify-center -mr-1 text-muted-foreground/60 hover:text-foreground z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange('');
                  }
                }}
              >
                <X className="h-3 w-3" />
              </div>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent
        className={cn('p-0', popoverWidth || 'w-[var(--radix-popover-trigger-width)]')}
        align="start"
      >
        <Command
          shouldFilter={mode === 'client'} // Only cmdk filters if in client mode
        >
          <div className="flex items-center border-b px-3">
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : null}
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
              className={cn("flex-1", isFetching && "ml-0")}
            />
          </div>
          
          <CommandList>
            <CommandEmpty>
              {isFetching ? loadingText : emptyText}
            </CommandEmpty>
            
            <CommandGroup>
              {activeOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && <span>{option.icon}</span>}
                    <span className="truncate">{option.label}</span>
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
