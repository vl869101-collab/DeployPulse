'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [step, setStep] = React.useState<'email' | 'sent'>('email');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setStep('sent');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2" aria-label="DeployPulse Home">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">DeployPulse</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            {step === 'email' ? (
              <>
                <CardTitle className="text-2xl">Forgot password?</CardTitle>
                <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Check your email</CardTitle>
                <CardDescription>
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => setStep('email')}>
                  Didn&apos;t receive it? Resend
                </Button>
                <Link href="/auth/login" className="block text-center text-sm text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}