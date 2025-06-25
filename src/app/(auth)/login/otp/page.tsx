'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { KeyRound, LogIn } from "lucide-react";
import Image from "next/image";
import { useToast } from '@/hooks/use-toast';

function OtpPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const portal = searchParams.get('portal');
  const email = searchParams.get('email');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would verify the OTP against the stored hash.
    // For this prototype, we'll just show a success message and redirect.
    toast({
      title: "Verification Successful",
      description: "You have been securely signed in.",
    });

    let dashboardUrl = '/';
    if (portal === 'company') {
      dashboardUrl = '/company-portal/dashboard';
    } else if (portal === 'superadmin') {
      dashboardUrl = '/superadmin/dashboard';
    } else if (portal === 'supplier') {
      dashboardUrl = '/supplier-portal/dashboard';
    } else if (portal === 'verifier') {
      dashboardUrl = '/verifier-portal/dashboard';
    }
    
    router.push(dashboardUrl);
  };

  if (!email || !portal) {
    return (
        <div className="w-full max-w-md text-center">
            <p className="text-destructive">Missing email or portal information. Please try signing in again.</p>
             <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-md">
       <Image src="/passportify-logo.png" alt="Passportify Logo" width={140} height={32} className="h-12 w-auto mb-8 mx-auto" />
      <form onSubmit={handleVerify}>
        <Card>
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification code to <br/>
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit Code</Label>
              <Input id="otp" type="text" inputMode="numeric" maxLength={6} required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              <LogIn className="mr-2" />
              Verify & Sign In
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Didn't receive a code? <button type="button" className="underline hover:text-primary">Click to resend</button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default function OtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OtpPageComponent />
        </Suspense>
    )
}
