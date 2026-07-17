'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../hooks/use-auth';
import { signUp } from '../../../lib/auth-client';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Clean registration page with Zod validation.
 */
export default function RegisterPage() {
  const { login: handleRegisterSuccess } = useAuth();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setGeneralError(null);
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: '/dashboard',
      });

      if (authError) {
        throw new Error(authError.message || 'Registration failed.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-12 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md border-zinc-900 bg-zinc-950/40 backdrop-blur-xl">
        <CardHeader className="space-y-2 flex flex-col items-center text-center">
          <Link href="/" className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md mb-2">
            <BrainCircuit className="h-6 w-6 text-white" />
          </Link>
          <CardTitle className="text-xl font-bold text-white">Create your account</CardTitle>
          <CardDescription>Get started today by registering your details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {generalError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-rose-400 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
              disabled={isLoading}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
              disabled={isLoading}
            />

            <Button type="submit" variant="primary" className="w-full mt-2 h-11 rounded-xl" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
