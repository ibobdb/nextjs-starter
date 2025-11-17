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
import { Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password minimal 8 karakter' })
      .max(128, { message: 'Password maksimal 128 karakter' })
      .regex(/[A-Z]/, {
        message: 'Password harus mengandung minimal 1 huruf besar',
      })
      .regex(/[a-z]/, {
        message: 'Password harus mengandung minimal 1 huruf kecil',
      })
      .regex(/[0-9]/, { message: 'Password harus mengandung minimal 1 angka' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
type MessageType = { type: 'error' | 'success' | ''; text: string };

interface ResetPasswordFormProps {
  token: string | null;
}

function ResetPasswordFormContent({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>({ type: '', text: '' });

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error('Token tidak valid');
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token,
      });

      if (error) {
        toast.error(error.message || 'Gagal mereset password');
        setMessage({
          type: 'error',
          text:
            error.message ||
            'Gagal mereset password. Token mungkin sudah kadaluarsa.',
        });
        setIsLoading(false);
        return;
      }

      toast.success('Password berhasil direset!');
      setMessage({
        type: 'success',
        text: 'Password berhasil direset! Mengalihkan ke halaman login...',
      });

      // Redirect to login after successful reset
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      toast.error('Terjadi kesalahan yang tidak terduga');
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan yang tidak terduga',
      });
      setIsLoading(false);
    }
  };

  // Show error if token is invalid
  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-destructive">
            Token Tidak Valid
          </CardTitle>
          <CardDescription className="text-center">
            Token reset password tidak ditemukan atau sudah kadaluarsa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Link reset password tidak valid atau sudah kadaluarsa. Silakan
              minta link reset password baru.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Minta Link Baru</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Kembali ke Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan password baru Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        disabled={isLoading}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
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

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password harus memenuhi kriteria:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Minimal 8 karakter</li>
                <li>Mengandung huruf besar (A-Z)</li>
                <li>Mengandung huruf kecil (a-z)</li>
                <li>Mengandung angka (0-9)</li>
              </ul>
            </div>

            {message.text && (
              <Alert
                variant={message.type === 'error' ? 'destructive' : 'default'}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Mereset...' : 'Reset Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Ingat password Anda?{' '}
          <Link
            href="/auth/login"
            className="text-primary hover:underline font-medium"
          >
            Login di sini
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <ResetPasswordFormContent token={token} />;
}
