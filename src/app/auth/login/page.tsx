'use client';

import { Suspense } from 'react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from './_components/login-form';
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Loading...
            </CardDescription>
          </CardHeader>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
