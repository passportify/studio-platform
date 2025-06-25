'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';
import { sendOtp } from '@/ai/flows/send-otp';

export default function SupplierPortalLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
      return;
    }
    setIsLoading(true);

    try {
      const otpResult = await sendOtp({ email });

      if (otpResult.success) {
        toast({ title: 'Verification Code Sent', description: 'Check your email for the 6-digit code.' });
        router.push(`/login/otp?portal=supplier&email=${encodeURIComponent(email)}`);
      } else {
        throw new Error('Could not send the verification code.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Sign In Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Image src="/passportify-logo.png" alt="Passportify Logo" width={140} height={32} className="h-12 w-auto mb-8 mx-auto" />
      <form onSubmit={handleSignIn}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Supplier Portal</CardTitle>
            <CardDescription>
              Sign in to provide traceability and compliance data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="contact@materialsupplier.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <LogIn className="mr-2" />}
              {isLoading ? 'Sending code...' : 'Sign In'}
            </Button>
            <div className="text-xs text-center text-muted-foreground space-x-2">
              <Link href="/company-portal" className="underline hover:text-primary">Brand Owner?</Link>
              <span>•</span>
              <Link href="/verifier-portal" className="underline hover:text-primary">Third-Party Verifier?</Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
