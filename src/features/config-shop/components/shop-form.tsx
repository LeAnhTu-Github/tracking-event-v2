'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  Package as PackageIcon,
  Store,
  Save,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { useGames } from '@/hooks/use-games';
import { usePackages } from '@/features/config-package/hooks/use-packages';
import { shopFormSchema, ShopFormValues, Shop, SHOP_TYPES } from '../types';
import { Package } from '@/features/config-package/types';
import shopService from '@/services/shop.service';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ShopFormProps {
  initialData?: Shop;
  isEdit?: boolean;
  isReadOnly?: boolean;
}

export default function ShopForm({
  initialData,
  isEdit = false,
  isReadOnly = false
}: ShopFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { data: gamesData } = useGames();

  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game.toUpperCase(),
      value: game
    }));
  }, [gamesData]);

  const defaultValues: ShopFormValues = React.useMemo(() => {
    const formatDateTimeLocal = (
      dateStr: string | null | undefined
    ): string => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
      } catch (e) {
        return '';
      }
    };

    if (!initialData) {
      return {
        gameId: gamesData?.[0] || '',
        name: '',
        type: SHOP_TYPES[0],
        isActive: true,
        packageConfig: {
          package: []
        },
        startTime: '',
        endTime: ''
      };
    }

    return {
      gameId: initialData.gameId,
      name: initialData.name,
      type: initialData.type,
      isActive: initialData.isActive,
      packageConfig: {
        package: (initialData.packageConfig?.package || []).map((pkg) => ({
          packageCode: pkg.packageCode,
          quantity: pkg.quantity,
          startTime: formatDateTimeLocal(pkg.startTime),
          endTime: formatDateTimeLocal(pkg.endTime)
        }))
      },
      startTime: formatDateTimeLocal(initialData.startTime),
      endTime: formatDateTimeLocal(initialData.endTime)
    };
  }, [initialData, gamesData]);

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(shopFormSchema) as any,
    defaultValues: defaultValues
  });

  const selectedGameId = form.watch('gameId');

  React.useEffect(() => {
    if (initialData) {
      const currentValues = form.getValues();
      // Only reset if identity changed or form is pristine
      if (initialData.name !== currentValues.name || !form.formState.isDirty) {
        form.reset(defaultValues);
      }
    } else if (gamesData && gamesData.length > 0) {
      if (!form.getValues('gameId')) {
        form.setValue('gameId', gamesData[0]);
      }
    }
  }, [initialData, gamesData, form, defaultValues]);

  const { data: packagesData } = usePackages(
    {
      size: 100,
      gameId: selectedGameId || (gamesData?.[0] ?? '')
    },
    !!(selectedGameId || gamesData?.[0])
  );

  const packageOptions = React.useMemo(() => {
    return (packagesData?.data || []).map((pkg: Package) => ({
      label: pkg.name,
      value: pkg.packageCode,
      image: pkg.urlImage
    }));
  }, [packagesData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'packageConfig.package'
  });

  async function onSubmit(values: ShopFormValues) {
    try {
      setIsSubmitting(true);
      const formatToISO = (
        dateStr: string | null | undefined
      ): string | null => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date.toISOString();
        } catch (e) {
          return null;
        }
      };

      const payload = {
        ...values,
        startTime: formatToISO(values.startTime),
        endTime: formatToISO(values.endTime),
        packageConfig: {
          package: values.packageConfig.package.map((pkg) => ({
            ...pkg,
            startTime: formatToISO(pkg.startTime),
            endTime: formatToISO(pkg.endTime)
          }))
        }
      };

      if (isEdit && initialData?.id) {
        await shopService.updateShop(initialData.id, payload);
        toast.success('Shop configuration updated successfully');
      } else {
        await shopService.createShop(payload);
        toast.success('Shop configuration created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['shops'] });
      router.push('/dashboard/config-shop');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save shop configuration');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form
      form={form as any}
      onSubmit={form.handleSubmit(onSubmit)}
      className='w-full space-y-8'
    >
      {/* Header with Save Button - Consistency with dashboard pattern */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-9 w-9'
            onClick={() => router.push('/dashboard/config-shop')}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {isEdit ? 'Edit Shop Entry' : 'Create New Shop Entry'}
            </h2>
            <p className='text-muted-foreground mt-0.5 flex items-center gap-1.5 text-sm'>
              <Store className='h-3.5 w-3.5' /> Configure items and availability
              for in-game shops
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* Action buttons removed from here to follow the user's request */}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8'>
        {/* Shop Information & Validity */}
        <Card className='overflow-hidden border-none shadow-md'>
          <CardHeader className='bg-muted/30 pb-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg'>
                <Store className='h-4 w-4' />
              </div>
              <CardTitle className='text-lg font-bold'>
                Shop Information
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='lg:col-span-2'>
                  <FormLabel>
                    Display Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. Summer Special Shop'
                      {...field}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gameId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Game ID <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isReadOnly || isEdit}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select game' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gameOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isReadOnly}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select shop type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHOP_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='startTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Start Time <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='datetime-local'
                      {...field}
                      value={field.value || ''}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='endTime'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    End Time <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type='datetime-local'
                      {...field}
                      value={field.value || ''}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between space-y-0 rounded-lg border p-4 lg:col-span-2'>
                  <div className='space-y-0.5'>
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription className='text-xs'>
                      Enable this shop
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Package Configuration */}
        <Card className='overflow-hidden border-none shadow-md'>
          <CardHeader className='bg-muted/30 flex flex-row items-center justify-between pb-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600'>
                <PackageIcon className='h-4 w-4' />
              </div>
              <CardTitle className='text-lg font-bold'>
                Packages <span className='text-destructive'>*</span>
              </CardTitle>
            </div>
            {!isReadOnly && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    packageCode: '',
                    quantity: 1,
                    startTime: '',
                    endTime: ''
                  })
                }
                className='h-8 gap-1'
              >
                <Plus className='h-3.5 w-3.5' /> Add Package
              </Button>
            )}
          </CardHeader>
          <div className='px-6'>
            {form.formState.errors.packageConfig?.package && (
              <p className='text-destructive mt-2 text-[0.8rem] font-medium'>
                {form.formState.errors.packageConfig.package.message ||
                  (form.formState.errors.packageConfig.package as any).root
                    ?.message}
              </p>
            )}
          </div>
          <CardContent className='p-0'>
            {fields.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <div className='bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full'>
                  <PackageIcon className='text-muted-foreground h-6 w-6' />
                </div>
                <p className='text-sm font-medium'>No Packages Configured</p>
                <p className='text-muted-foreground mt-1 text-xs'>
                  Click "Add Package" to include items in this shop.
                </p>
              </div>
            ) : (
              <div className='divide-y border-t'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='group hover:bg-muted/50 relative p-6 transition-colors'
                  >
                    <div className='flex items-start gap-6'>
                      <Badge
                        variant='outline'
                        className='bg-background mt-2 flex h-6 w-6 items-center justify-center rounded-full p-0'
                      >
                        {index + 1}
                      </Badge>

                      <div className='grid flex-1 grid-cols-1 gap-6 md:grid-cols-2'>
                        <FormField
                          control={form.control}
                          name={`packageConfig.package.${index}.packageCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-muted-foreground text-xs font-bold uppercase'>
                                Package Item{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isReadOnly}
                              >
                                <FormControl>
                                  <SelectTrigger className='bg-background h-10 w-full'>
                                    <SelectValue placeholder='Select a package' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className='max-h-80'>
                                  {packageOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      <div className='flex items-center gap-3'>
                                        <div className='bg-muted flex h-6 w-6 items-center justify-center overflow-hidden rounded border'>
                                          {opt.image ? (
                                            <img
                                              src={opt.image}
                                              alt=''
                                              className='h-full w-full object-cover'
                                            />
                                          ) : (
                                            <PackageIcon className='h-3 w-3 opacity-30' />
                                          )}
                                        </div>
                                        <div className='flex flex-col'>
                                          <span className='text-sm font-medium'>
                                            {opt.label}
                                          </span>
                                          <span className='text-muted-foreground font-mono text-[10px] leading-none'>
                                            {opt.value}
                                          </span>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`packageConfig.package.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-muted-foreground text-xs font-bold uppercase'>
                                Quantity{' '}
                                <span className='text-destructive'>*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={1}
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className='bg-background h-10'
                                  disabled={isReadOnly}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='grid grid-cols-1 gap-6 md:col-span-2 md:grid-cols-2'>
                          <FormField
                            control={form.control}
                            name={`packageConfig.package.${index}.startTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-muted-foreground text-xs font-bold uppercase'>
                                  Available From
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='datetime-local'
                                    {...field}
                                    value={field.value || ''}
                                    className='bg-background h-10'
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`packageConfig.package.${index}.endTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className='text-muted-foreground text-xs font-bold uppercase'>
                                  Available Until
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type='datetime-local'
                                    {...field}
                                    value={field.value || ''}
                                    className='bg-background h-10'
                                    disabled={isReadOnly}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {!isReadOnly && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='text-muted-foreground hover:text-destructive mt-8 h-8 w-8 transition-all'
                          onClick={() => remove(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions - Moved to the bottom */}
        {!isReadOnly && (
          <div className='flex items-center justify-end gap-4 border-t py-8'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.push('/dashboard/config-shop')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='shadow-primary/20 h-10 min-w-[200px] gap-2 text-base font-bold shadow-lg'
            >
              {isSubmitting ? (
                <Loader2 className='h-5 w-5 animate-spin' />
              ) : (
                <Save className='h-5 w-5' />
              )}
              Save Configuration
            </Button>
          </div>
        )}
      </div>
    </Form>
  );
}
