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
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [email, setEmail] = useState('');

  const handleForgotPassword = () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Simulate API call
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: 'Link reset password telah dikirim ke email Anda!',
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <Link
          href="/login"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Kembali ke login
        </Link>
        <CardTitle className="text-2xl font-bold text-center">
          Lupa Password
        </CardTitle>
        <CardDescription className="text-center">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset
          password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          {message.text && (
            <Alert
              variant={message.type === 'error' ? 'destructive' : 'default'}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleForgotPassword}
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
        </div>
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
