'use client';
import { useState } from 'react';
import Link from 'next/link';
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
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { RegisterRequest } from '@/types/register';
import { authClient } from '@/lib/auth-client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
const schema = z
  .object({
    name: z.string().min(2, 'Nama harus terdiri dari minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z
      .string()
      .min(6, 'Password harus terdiri dari minimal 6 karakter'),
    confirmPassword: z
      .string()
      .min(6, 'Konfirmasi password harus terdiri dari minimal 6 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi password harus sama',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const form = useForm<RegisterRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      callbackURL: '/auth',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    await authClient.signUp.email(values, {
      onRequest: () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
      },
      onSuccess: () => {
        toast.success(
          'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.'
        );

        form.reset();
        setMessage({
          type: 'success',
          text: 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.',
        });
      },
      onError: (ctx) => {
        toast.error('Registrasi gagal! Silakan coba lagi.');
        setMessage({
          type: 'error',
          text: ctx.error.message,
        });
      },
    });
    setIsLoading(false);
  };
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Registrasi
        </CardTitle>
        <CardDescription className="text-center">
          Buat akun baru untuk memulai
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Nama Lengkap"
                          className="pl-10"
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
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
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
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
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

              {message.text && (
                <Alert
                  variant={message.type === 'error' ? 'destructive' : 'default'}
                >
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Daftar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{' '}
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
