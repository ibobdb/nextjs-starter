'use client';

/**
 * Dialog System — Programmatic dialog hooks (DBStudio Base)
 *
 * Replace scattered AlertDialog state with clean async hooks:
 *
 * @example useConfirm
 * ```tsx
 * const confirm = useConfirm();
 * const ok = await confirm({
 *   title: 'Delete team?',
 *   description: 'This cannot be undone.',
 *   confirmLabel: 'Delete',
 *   variant: 'destructive',
 * });
 * if (ok) await deleteTeam(id);
 * ```
 *
 * @example useAlert
 * ```tsx
 * const alert = useAlert();
 * await alert({ title: 'Done!', description: 'Team created successfully.' });
 * ```
 *
 * @example usePrompt
 * ```tsx
 * const prompt = usePrompt();
 * const value = await prompt({ title: 'Rename team', placeholder: 'Team name...' });
 * if (value !== null) await renameTeam(id, value);
 * ```
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Changes the confirm button style */
  variant?: 'default' | 'destructive';
}

export interface AlertOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: 'default' | 'destructive' | 'info' | 'success' | 'warning';
}

export interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

// ─── Internal dialog state ───────────────────────────────────────────────────

type DialogState =
  | { type: 'confirm'; options: ConfirmOptions; resolve: (v: boolean) => void }
  | { type: 'alert'; options: AlertOptions; resolve: () => void }
  | { type: 'prompt'; options: PromptOptions; resolve: (v: string | null) => void };

// ─── Context ─────────────────────────────────────────────────────────────────

interface DialogContextValue {
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
  openAlert: (options: AlertOptions) => Promise<void>;
  openPrompt: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const resolveRef = useRef<((v: unknown) => void) | null>(null);

  const openConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve as (v: unknown) => void;
      setState({ type: 'confirm', options, resolve });
    });
  }, []);

  const openAlert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve as (v: unknown) => void;
      setState({ type: 'alert', options, resolve });
    });
  }, []);

  const openPrompt = useCallback((options: PromptOptions): Promise<string | null> => {
    setPromptValue(options.defaultValue ?? '');
    return new Promise((resolve) => {
      resolveRef.current = resolve as (v: unknown) => void;
      setState({ type: 'prompt', options, resolve });
    });
  }, []);

  const close = () => setState(null);

  return (
    <DialogContext.Provider value={{ openConfirm, openAlert, openPrompt }}>
      {children}

      {/* ── Confirm Dialog ─────────────────────────────────────────── */}
      {state?.type === 'confirm' && (
        <AlertDialog open onOpenChange={(open) => { if (!open) { state.resolve(false); close(); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{state.options.title}</AlertDialogTitle>
              {state.options.description && (
                <AlertDialogDescription>{state.options.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { state.resolve(false); close(); }}>
                {state.options.cancelLabel ?? 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { state.resolve(true); close(); }}
                className={cn(
                  state.options.variant === 'destructive' &&
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                )}
              >
                {state.options.confirmLabel ?? 'Confirm'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ── Alert Dialog ──────────────────────────────────────────── */}
      {state?.type === 'alert' && (
        <AlertDialog open onOpenChange={(open) => { if (!open) { state.resolve(); close(); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle
                className={cn(
                  state.options.variant === 'destructive' && 'text-destructive',
                  state.options.variant === 'success' && 'text-emerald-600',
                  state.options.variant === 'warning' && 'text-amber-600',
                  state.options.variant === 'info' && 'text-blue-600',
                )}
              >
                {state.options.title}
              </AlertDialogTitle>
              {state.options.description && (
                <AlertDialogDescription>{state.options.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => { state.resolve(); close(); }}
                className={cn(
                  state.options.variant === 'destructive' &&
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                )}
              >
                {state.options.confirmLabel ?? 'OK'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* ── Prompt Dialog ─────────────────────────────────────────── */}
      {state?.type === 'prompt' && (
        <Dialog open onOpenChange={(open) => { if (!open) { state.resolve(null); close(); } }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{state.options.title}</DialogTitle>
              {state.options.description && (
                <DialogDescription>{state.options.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="space-y-2 py-2">
              {state.options.label && (
                <Label htmlFor="dialog-prompt-input">{state.options.label}</Label>
              )}
              <Input
                id="dialog-prompt-input"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={state.options.placeholder}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && promptValue.trim()) {
                    state.resolve(promptValue);
                    close();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { state.resolve(null); close(); }}>
                {state.options.cancelLabel ?? 'Cancel'}
              </Button>
              <Button
                onClick={() => { state.resolve(promptValue); close(); }}
                disabled={!promptValue.trim()}
              >
                {state.options.confirmLabel ?? 'Confirm'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DialogContext.Provider>
  );
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useConfirm/useAlert/usePrompt must be used inside <DialogProvider>');
  return ctx;
}

/**
 * Programmatic confirm dialog.
 * Returns true if user clicked confirm, false if cancelled.
 */
export function useConfirm() {
  return useDialogContext().openConfirm;
}

/**
 * Programmatic alert dialog (one button — OK).
 */
export function useAlert() {
  return useDialogContext().openAlert;
}

/**
 * Programmatic prompt dialog.
 * Returns the typed string, or null if cancelled.
 */
export function usePrompt() {
  return useDialogContext().openPrompt;
}
