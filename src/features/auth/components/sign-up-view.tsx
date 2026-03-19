'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function SignUpViewPage() {
  const router = useRouter();

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-zinc-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Logo
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <Card className='w-full max-w-md py-10'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>Sign Up</CardTitle>
            <CardDescription>
              User registration is currently managed by administrators.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
              Please contact your administrator to create an account, or sign in
              if you already have one.
            </p>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={() => router.push('/auth/sign-in')}
                className='w-full'
              >
                Go to Sign In
              </Button>
              <Button
                variant='outline'
                onClick={() => router.push('/')}
                className='w-full'
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
