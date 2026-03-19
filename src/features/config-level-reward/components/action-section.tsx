'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ActionSectionProps {
  title: React.ReactNode;
  description?: string;
  badge?: string;
  variant?: 'blue' | 'green' | 'orange';
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function ActionSection({
  title,
  description,
  badge,
  variant = 'blue',
  children,
  headerAction
}: ActionSectionProps) {
  const variants = {
    blue: 'bg-linear-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800',
    green:
      'bg-linear-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800',
    orange:
      'bg-linear-to-br from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800'
  };

  const badgeVariants = {
    blue: 'default',
    green: 'secondary',
    orange: 'outline'
  };

  return (
    <Card
      className={cn(
        'overflow-hidden border shadow-sm transition-all',
        variants[variant]
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <CardTitle className='text-base font-bold'>{title}</CardTitle>
              {badge && (
                <Badge
                  variant={badgeVariants[variant] as any}
                  className='h-4 text-[10px] uppercase'
                >
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <CardDescription className='text-xs'>
                {description}
              </CardDescription>
            )}
          </div>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent className='space-y-4 pt-0'>
        <Separator className='opacity-50' />
        {children}
      </CardContent>
    </Card>
  );
}
