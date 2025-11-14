'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Suspense } from 'react';
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
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z
    .string()
    .min(8, { message: 'Password minimal 8 karakter' })
    .max(128, { message: 'Password maksimal 128 karakter' }),
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
          onSuccess: () => {
            toast.success('Login berhasil!');
            setMessage({
              type: 'success',
              text: 'Login berhasil! Mengalihkan...',
            });

            setTimeout(() => {
              router.push(callbackUrl);
              router.refresh();
            }, 500);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Login gagal!');

            // Jika email belum terverifikasi (403)
            if (ctx.response.status === 403) {
              setMessage({
                type: 'error',
                text: (
                  <div className="flex flex-col gap-1">
                    <span>
                      Email belum terverifikasi. Silakan periksa email Anda.
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
                              'Gagal mengirim ulang email verifikasi.'
                            );
                            return;
                          }

                          toast.success(
                            'Email verifikasi telah dikirim ulang!'
                          );
                          setMessage({
                            type: 'success',
                            text: 'Email verifikasi sudah dikirim ulang. Silakan cek inbox.',
                          });
                        } catch (error) {
                          console.error(
                            'Error resending verification email:',
                            error
                          );
                          toast.error('Gagal mengirim ulang email verifikasi.');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      Kirim Ulang
                    </Button>
                  </div>
                ),
              });
            } else {
              setMessage({
                type: 'error',
                text: ctx.error.message || 'Email atau password salah.',
              });
            }
            setIsLoading(false);
          },
        }
      );
    } catch (error) {
      console.error('Unexpected error during login:', error);
      toast.error('Terjadi kesalahan yang tidak terduga.');
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan yang tidak terduga.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Masukkan email dan password Anda untuk login
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
                        placeholder="nama@example.com"
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
                Lupa password?
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
          Belum punya akun?{' '}
          <Link
            href="/auth/register"
            className="text-primary hover:underline font-medium"
          >
            Daftar sekarang
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
