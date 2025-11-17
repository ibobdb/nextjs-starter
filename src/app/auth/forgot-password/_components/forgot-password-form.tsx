'use client';
import { useState } from 'react';
import Link from 'next/link';
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
import { Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type MessageType = { type: 'error' | 'success' | ''; text: string };

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>({ type: '', text: '' });

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await authClient.forgetPassword({
        email: values.email,
        redirectTo: '/auth/reset-password',
      });

      if (error) {
        toast.error(error.message || 'Gagal mengirim email reset password');
        setMessage({
          type: 'error',
          text: error.message || 'Gagal mengirim email reset password',
        });
        setIsLoading(false);
        return;
      }

      toast.success('Link reset password telah dikirim ke email Anda!');
      setMessage({
        type: 'success',
        text: 'Link reset password telah dikirim! Silakan periksa email Anda.',
      });

      // Reset form after success
      form.reset();
      setIsLoading(false);
    } catch (error) {
      console.error('Unexpected error during forgot password:', error);
      toast.error('Terjadi kesalahan yang tidak terduga');
      setMessage({
        type: 'error',
        text: 'Terjadi kesalahan yang tidak terduga',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Lupa Password
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset
          password
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

            {message.text && (
              <Alert
                variant={message.type === 'error' ? 'destructive' : 'default'}
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
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
