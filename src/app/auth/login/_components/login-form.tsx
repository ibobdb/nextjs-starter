'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(128, { message: 'Password must not exceed 128 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type MessageType = { type: 'error' | 'success' | ''; text: React.ReactNode };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/default';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>({ type: '', text: '' });
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: (ctx) => {
            if (ctx.data?.twoFactorRedirect) {
              setRequires2FA(true);
              setMessage({ type: '', text: '' });
              setIsLoading(false);
              return;
            }

            toast.success('Login successful!');
            setMessage({
              type: 'success',
              text: 'Login successful! Redirecting...',
            });

            setTimeout(() => {
              router.push(callbackUrl);
              router.refresh();
            }, 500);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Login failed!');

            // If email not verified (403)
            if (ctx.response.status === 403) {
              setMessage({
                type: 'error',
                text: (
                <div className="flex flex-col gap-1">
                    <span>
                      Email not verified. Please check your inbox.
                    </span>

                    <Button
                      variant="link"
                      type="button"
                      className="underline text-primary p-0 h-auto w-fit"
                      onClick={async () => {
                        try {
                          setIsLoading(true);

                          const { error } =
                            await authClient.sendVerificationEmail({
                              email: values.email,
                              callbackURL: '/auth',
                            });

                          if (error?.message) {
                            toast.error(
                              'Failed to resend verification email.'
                            );
                            return;
                          }

                          toast.success(
                            'Verification email has been resent!'
                          );
                          setMessage({
                            type: 'success',
                            text: 'Verification email sent. Please check your inbox.',
                          });
                        } catch (error) {
                          console.error(
                            'Error resending verification email:',
                            error
                          );
                          toast.error('Failed to resend verification email.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      Resend Email
                    </Button>
                  </div>
                ),
              });
            } else {
              setMessage({
                type: 'error',
                text: ctx.error.message || 'Invalid email or password.',
              });
            }
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error('An unexpected error occurred.');
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred.',
      });
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length !== 6) return toast.error('Invalid code format');
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: totpCode,
        trustDevice: true,
      });
      
      if (error) throw new Error(error.message);
      
      toast.success('2FA verification successful!');
      setMessage({
        type: 'success',
        text: 'Verification successful! Redirecting...',
      });

      setTimeout(() => {
        router.push(callbackUrl);
        router.refresh();
      }, 500);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Invalid 2FA code');
      setMessage({
        type: 'error',
        text: 'The verification code you entered is invalid or expired.',
      });
      setIsLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">2FA Verification</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input 
                placeholder="000000" 
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
                disabled={isLoading}
                className="font-mono text-center tracking-widest text-lg"
              />
            </div>
            {message.text && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mt-4">
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full mt-4" disabled={isLoading || totpCode.length !== 6}>
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={() => setRequires2FA(false)} disabled={isLoading}>
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to login
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        disabled={isLoading}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {message.text && (
              <Alert
                variant={message.type === 'error' ? 'destructive' : 'default'}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-medium"
          >
            Register now
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
