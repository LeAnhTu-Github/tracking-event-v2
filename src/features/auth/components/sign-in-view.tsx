'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import authService from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'Please enter a valid username'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SignInViewPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  const { setIsAuthenticated } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data.username, data.password);

      Cookies.set('token', response.token);
      setIsAuthenticated(true);

      // Redirect to dashboard or callback URL
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl =
        searchParams.get('callbackUrl') || '/dashboard/overview';
      toast.success('Login successful');
      router.push(callbackUrl);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800' />
        <div className='absolute inset-0 bg-[url("/grid.svg")] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] bg-center opacity-20' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src={'/logo.png'}
            alt='logo'
            width={200}
            height={100}
            className='h-auto w-auto'
          />
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <Card className='w-full max-w-md py-10'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-2xl font-bold'>Welcome back</CardTitle>
            <CardDescription>
              Enter your username to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  type='text'
                  placeholder='username'
                  {...register('username')}
                  className={cn(
                    'transition-all duration-200',
                    errors.username &&
                      'border-red-500 focus-visible:ring-red-500'
                  )}
                />
                {errors.username && (
                  <p className='animate-in fade-in-50 text-sm text-red-500'>
                    {errors.username.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    {...register('password')}
                    className={cn(
                      'pr-10 transition-all duration-200',
                      errors.password &&
                        'border-red-500 focus-visible:ring-red-500'
                    )}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Icons.eye className='text-muted-foreground h-4 w-4' />
                    ) : (
                      <Icons.eyeOff className='text-muted-foreground h-4 w-4' />
                    )}
                    <span className='sr-only'>
                      {showPassword ? 'Hide password' : 'Show password'}
                    </span>
                  </Button>
                </div>
                {errors.password && (
                  <p className='animate-in fade-in-50 text-sm text-red-500'>
                    {errors.password.message}
                  </p>
                )}
              </div>
              <Button type='submit' className='w-full' disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
