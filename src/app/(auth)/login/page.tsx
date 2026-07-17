'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BrainCircuit, AlertCircle, Sparkles } from 'lucide-react';
import { signIn, signUp } from '../../../lib/auth-client';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Clean login page with Zod validation, social credentials, and demo accounts.
 */
export default function LoginPage() {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGeneralError(null);
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/dashboard',
      });

      if (authError) {
        throw new Error(authError.message || 'Invalid email or password credentials.');
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Invalid email or password credential.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError(null);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    } catch (err: any) {
      setGeneralError(err.message || 'Google authentication failed.');
    }
  };

  const handleDemoLogin = async () => {
    setGeneralError(null);
    setIsLoading(true);
    const demoData = {
      email: 'demo@documind.com',
      password: 'demopassword123',
    };
    try {
      // 1. Try to sign in first
      const { data: signInData, error: signInError } = await signIn.email({
        email: demoData.email,
        password: demoData.password,
        callbackURL: '/dashboard',
      });

      // 2. If user not found, auto-provision
      if (signInError) {
        const { data: signUpData, error: signUpError } = await signUp.email({
          email: demoData.email,
          password: demoData.password,
          name: 'Demo Account',
          callbackURL: '/dashboard',
        });

        if (signUpError) {
          throw new Error(signUpError.message || 'Demo account provisioning failed.');
        }
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Demo Login failed.');
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
          <CardTitle className="text-xl font-bold text-white">Welcome back</CardTitle>
          <CardDescription>Access your workspace using email or credentials below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generalError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" variant="primary" className="w-full mt-2 h-11 rounded-xl font-bold" isLoading={isLoading}>
              Sign In with Email
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute w-full border-t border-zinc-900"></div>
            <span className="relative bg-[#09090b] px-3.5 text-[10px] font-bold tracking-widest uppercase text-zinc-550 z-10">
              Or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Google OAuth Login */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="h-11 rounded-xl text-xs font-bold border-zinc-800 hover:bg-zinc-900/60 flex items-center justify-center gap-2"
            >
              {/* Google G logo SVG */}
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </Button>

            {/* Quick Demo Login */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="h-11 rounded-xl text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/10 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-400 animate-pulse" />
              <span>Demo Account</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-900/50 pt-4">
          <p className="text-xs text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
