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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  CreditCard,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useGames } from '@/hooks/use-games';
import { useItems } from '@/features/config-item/hooks/use-items';
import {
  packageFormSchema,
  PackageFormValues,
  PaymentTypeEnum,
  DiscountConditionEnum,
  type Package as PackageConfig
} from '../types';
import packageService from '@/services/package.service';
import imageService from '@/services/image.service';

const PAYMENT_TYPES: {
  value: 'VIP_BENEFITS' | 'WATCH_ADS' | 'TOKEN' | 'GAME_ITEM';
  label: string;
  description: string;
}[] = [
  {
    value: 'VIP_BENEFITS',
    label: 'VIP Benefits',
    description: 'Free for VIP members'
  },
  {
    value: 'WATCH_ADS',
    label: 'Watch Ads',
    description: 'Watch an advertisement'
  },
  { value: 'TOKEN', label: 'Token', description: 'Pay with in-game tokens' },
  { value: 'GAME_ITEM', label: 'Item', description: 'Pay with inventory items' }
];

const ITEM_BENEFIT_TYPES: {
  value: 'VIP_BENEFITS' | 'WATCH_ADS' | 'TOKEN' | 'GAME_ITEM';
  label: string;
  description: string;
}[] = [
  {
    value: 'VIP_BENEFITS',
    label: 'VIP Benefits',
    description: 'VIP status and benefits'
  },
  { value: 'WATCH_ADS', label: 'Watch Ads', description: 'Ad-related rewards' },
  { value: 'TOKEN', label: 'Token', description: 'In-game currency items' },
  {
    value: 'GAME_ITEM',
    label: 'Game Item',
    description: 'Regular in-game items'
  }
];

interface ItemOption {
  label: string;
  value: string;
  code: string;
  icon?: string;
}

interface ItemOptionGroup {
  type: string;
  options: ItemOption[];
}

interface PackageConfigFormProps {
  initialData?: PackageConfig | null;
  isEdit?: boolean;
  isReadOnly?: boolean;
}

interface PackageItemPayload {
  id: number;
  configItemId: number;
  quantity?: number;
  durationDays?: number;
}

type ImageFieldName =
  | 'urlImage'
  | 'discount.urlImage'
  | 'discount.discountIcon';

interface ImageUploadAreaProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  label: string;
  fieldName: ImageFieldName;
}

export default function PackageConfigForm({
  initialData,
  isEdit = false,
  isReadOnly = false
}: PackageConfigFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadingField, setUploadingField] = React.useState<string | null>(
    null
  );
  const [isDiscountEnabled, setIsDiscountEnabled] = React.useState(
    !!initialData?.discount
  );
  const { data: gamesData } = useGames();
  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game,
      value: game
    }));
  }, [gamesData]);

  const defaultValues = React.useMemo(() => {
    const firstGameId = gamesData && gamesData.length > 0 ? gamesData[0] : '';

    const formatDateTimeLocal = (dateStr: string | null | undefined) => {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        // Format: YYYY-MM-DDTHH:mm
        return date.toISOString().slice(0, 16);
      } catch (e) {
        return '';
      }
    };

    if (!initialData) {
      return {
        gameId: firstGameId,
        packageCode: '',
        name: '',
        urlImage: '',
        description: '',
        packageType: 'COMBO',
        iapType: 'OneTimePurchase',
        types: [],
        purchaseOptions: {
          paymentVendor: []
        },
        items: [],
        discount: null
      };
    }

    const discount = initialData.discount
      ? {
          ...initialData.discount,
          isActive:
            initialData.discount.isActive ??
            initialData.discount.active ??
            false,
          startTime: formatDateTimeLocal(initialData.discount.startTime),
          endTime: formatDateTimeLocal(initialData.discount.endTime)
        }
      : null;

    return {
      gameId: initialData.gameId || firstGameId,
      packageCode: initialData.packageCode ?? '',
      name: initialData.name ?? '',
      urlImage: initialData.urlImage ?? '',
      description: initialData.description ?? '',
      packageType: initialData.packageType ?? 'COMBO',
      iapType: initialData.iapType ?? 'OneTimePurchase',
      types: initialData.types ?? [],
      purchaseOptions: {
        paymentVendor: initialData.purchaseOptions?.paymentVendor ?? []
      },
      items: initialData.items ?? [],
      discount: discount
    };
  }, [initialData, gamesData]);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema) as any,
    defaultValues: defaultValues as any
  });

  const selectedGameId = form.watch('gameId');
  const { data: itemsData } = useItems({
    gameId: selectedGameId || (gamesData?.[0] ?? ''),
    size: 50
  });

  const itemTypeMap = React.useMemo(() => {
    const map = new Map<number, string>();
    const items = itemsData?.data ?? [];
    items.forEach((item) => {
      let type = item.type;
      if (type === 'VIP') type = 'VIP_BENEFITS';
      if (type === 'ADS') type = 'WATCH_ADS';
      map.set(item.id, type);
    });
    return map;
  }, [itemsData]);

  const itemOptions: ItemOptionGroup[] = React.useMemo(() => {
    const items = itemsData?.data ?? [];
    const grouped = items.reduce<Record<string, ItemOption[]>>((acc, item) => {
      let type = item.type || 'OTHER';
      if (type === 'VIP') type = 'VIP_BENEFITS';
      if (type === 'ADS') type = 'WATCH_ADS';
      if (!acc[type]) acc[type] = [];
      acc[type].push({
        label: `${item.name} (${item.itemCode})`,
        value: item.id.toString(),
        code: item.itemCode,
        icon: item.urlIcon
      });
      return acc;
    }, {});

    return Object.entries(grouped).map(([type, options]) => ({
      type,
      options
    }));
  }, [itemsData]);

  const {
    fields: vendorFields,
    append: appendVendor,
    remove: removeVendor
  } = useFieldArray<PackageFormValues, 'purchaseOptions.paymentVendor'>({
    control: form.control,
    name: 'purchaseOptions.paymentVendor'
  });

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem
  } = useFieldArray<PackageFormValues, 'items'>({
    control: form.control,
    name: 'items'
  });

  React.useEffect(() => {
    if (initialData) {
      // Only reset if it's a different record or if the form is empty/uninitialized
      const currentId = form.getValues('packageCode'); // Using packageCode as a proxy for identity if id is not in form
      if (currentId !== initialData.packageCode || !form.formState.isDirty) {
        form.reset(defaultValues as Partial<PackageFormValues>);
        setIsDiscountEnabled(!!initialData.discount);
      }
    } else if (gamesData && gamesData.length > 0) {
      const currentGameId = form.getValues('gameId');
      if (!currentGameId) {
        form.setValue('gameId', gamesData[0]);
      }
    }
  }, [initialData, form, defaultValues, gamesData]);

  async function onSubmit(values: PackageFormValues) {
    try {
      setIsSubmitting(true);
      const formatToISO = (dateStr: string | null | undefined) => {
        if (!dateStr) return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date.toISOString();
        } catch (e) {
          return null;
        }
      };

      const discountPayload =
        isDiscountEnabled && values.discount
          ? {
              ...values.discount,
              active: values.discount.isActive,
              gameId: values.gameId,
              startTime: formatToISO(values.discount.startTime),
              endTime: formatToISO(values.discount.endTime)
            }
          : null;

      const normalizedItems: PackageItemPayload[] =
        values.items?.map((item) => ({
          id: item.id ?? 0,
          configItemId: item.configItemId,
          quantity: item.quantity ?? 0,
          durationDays: item.durationDays ?? 0
        })) ?? [];

      const payload: PackageFormValues = {
        gameId: values.gameId,
        packageCode: values.packageCode,
        name: values.name,
        urlImage: values.urlImage,
        description: values.description,
        purchaseOptions: values.purchaseOptions,
        packageType: (values.packageType ??
          'COMBO') as PackageFormValues['packageType'],
        iapType: (values.iapType ??
          'OneTimePurchase') as PackageFormValues['iapType'],
        types: null,
        items: normalizedItems as PackageFormValues['items'],
        discount: discountPayload as PackageFormValues['discount']
      };
      if (isEdit && initialData?.id) {
        await packageService.updatePackage(initialData.id, payload);
        toast.success('Package updated successfully');
      } else {
        await packageService.createPackage(payload as any);
        toast.success('Package created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['packages'] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({
          queryKey: ['package', initialData.id]
        });
      }

      router.push('/dashboard/config-package');
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to save package configuration');
      } else {
        toast.error('Failed to save package configuration');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: ImageFieldName
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingField(fieldName);
      const res = await imageService.uploadCloudflare(file, 'packages');
      if (res.url) {
        form.setValue(fieldName, res.url);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingField(null);
    }
  };

  const ImageUploadArea = ({
    value,
    onChange,
    label,
    fieldName
  }: ImageUploadAreaProps) => (
    <FormItem className='flex h-full flex-col'>
      <FormLabel>{label}</FormLabel>
      <div className='flex flex-1 flex-col gap-4'>
        <div
          className={cn(
            'bg-muted/50 hover:bg-muted relative flex min-h-[150px] w-full flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all',
            value && 'border-primary/20 border-solid',
            isReadOnly && 'cursor-default'
          )}
          onClick={() =>
            !isReadOnly &&
            !value &&
            document.getElementById(`upload-${fieldName}`)?.click()
          }
        >
          {value ? (
            <>
              <Image
                src={value}
                alt='Preview'
                fill
                className='object-contain p-2'
                unoptimized
              />
              {!isReadOnly && (
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='absolute top-2 right-2 h-7 w-7 rounded-full'
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                >
                  <X className='h-3.5 w-3.5' />
                </Button>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center gap-1.5 py-4'>
              {uploadingField === fieldName ? (
                <Loader2 className='text-primary/40 h-8 w-8 animate-spin' />
              ) : (
                <ImageIcon className='text-muted-foreground/40 h-8 w-8' />
              )}
              <p className='text-muted-foreground px-4 text-center text-[10px]'>
                {uploadingField === fieldName
                  ? 'Uploading...'
                  : 'No image. Click to upload.'}
              </p>
            </div>
          )}
        </div>
        {!isReadOnly && (
          <div className='flex gap-2'>
            <Input
              placeholder='Image URL'
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className='h-8 text-xs'
            />
            <input
              type='file'
              id={`upload-${fieldName}`}
              className='hidden'
              accept='image/*'
              onChange={(e) => handleFileUpload(e, fieldName)}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={uploadingField === fieldName}
              onClick={() =>
                document.getElementById(`upload-${fieldName}`)?.click()
              }
              className='h-8 shrink-0'
            >
              <Upload className='mr-1.5 h-3.5 w-3.5' /> Upload
            </Button>
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-8'
    >
      {/* Basic Configuration */}
      <Card className='overflow-hidden border-none shadow-md'>
        <CardHeader className='bg-muted/30 pb-4'>
          <CardTitle className='text-lg font-bold'>
            Package Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-4 lg:col-span-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Package name'
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
                name='packageCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Package Code <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Unique code'
                        {...field}
                        disabled={isReadOnly || isEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
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
                name='packageType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Package Type <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='COMBO'>
                          COMBO (Gói combo nhiều item)
                        </SelectItem>
                        <SelectItem value='SINGLE'>
                          SINGLE (Gói item đơn)
                        </SelectItem>
                        <SelectItem value='ADS'>ADS (Gói quảng cáo)</SelectItem>
                        <SelectItem value='FREE'>
                          FREE (Gói miễn phí)
                        </SelectItem>
                        <SelectItem value='BUNDLE'>
                          BUNDLE (Gói bundle)
                        </SelectItem>
                        <SelectItem value='PROP'>
                          PROP (Gói vật phẩm)
                        </SelectItem>
                        <SelectItem value='RESOURCE_COIN'>
                          RESOURCE_COIN (Gói coin)
                        </SelectItem>
                        <SelectItem value='RESOURCE_GEM'>
                          RESOURCE_GEM (Gói gem)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='iapType'
                render={({ field }) => (
                  <FormItem className='sm:col-span-2 lg:col-span-1'>
                    <FormLabel>IAP Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadOnly}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='IAP Type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='OneTimePurchase'>
                          One Time Purchase
                        </SelectItem>
                        <SelectItem value='Subscription'>
                          Subscription
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Short description'
                      className='h-24 resize-none'
                      {...field}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='lg:col-span-1'>
            <FormField
              control={form.control}
              name='urlImage'
              render={({ field }) => (
                <ImageUploadArea
                  value={field.value}
                  onChange={field.onChange}
                  label='Package Image'
                  fieldName='urlImage'
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Action Configuration - Replaced Purchase Options */}
        <Card className='flex h-full flex-col overflow-hidden border-none shadow-md'>
          <CardHeader className='bg-muted/30 flex flex-row items-center justify-between pb-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600'>
                <CreditCard className='h-4 w-4' />
              </div>
              <div>
                <CardTitle className='text-lg font-bold'>
                  Purchase Options
                </CardTitle>
                <CardDescription className='text-xs'>
                  Configure purchase methods for this package
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col p-6'>
            <div className='flex-1 rounded-xl border border-blue-200 bg-linear-to-br from-blue-500/10 to-blue-600/5 p-6 transition-all hover:shadow-md dark:border-blue-800'>
              <div className='mb-4 flex items-center justify-between'>
                <div>
                  <h3 className='flex items-center gap-2 text-base font-bold text-blue-700 dark:text-blue-300'>
                    Purchase Action
                    <Badge
                      variant='default'
                      className='h-4 bg-blue-600 text-[10px] uppercase hover:bg-blue-600/90'
                    >
                      PURCHASE
                    </Badge>
                  </h3>
                  <p className='text-muted-foreground mt-0.5 text-xs'>
                    {vendorFields.length === 0
                      ? 'Select at least one payment method'
                      : `${vendorFields.length} method(s) configured`}
                  </p>
                </div>
              </div>

              <Separator className='mb-4 opacity-50' />

              <div className='grid gap-4'>
                {PAYMENT_TYPES.map((pt) => {
                  const vendorIndex = vendorFields.findIndex(
                    (v) => v.paymentType === pt.value
                  );
                  const isChecked = vendorIndex !== -1;

                  return (
                    <div
                      key={pt.value}
                      className={cn(
                        'bg-background/60 rounded-lg border p-4 transition-all',
                        isChecked
                          ? 'border-blue-500/30 bg-blue-500/5 shadow-sm'
                          : 'border-border/50'
                      )}
                    >
                      <div className='flex items-start gap-4'>
                        <Checkbox
                          id={`pt-${pt.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              appendVendor({
                                paymentType: pt.value,
                                status: 'active',
                                amount: 0,
                                itemCode: ''
                              });
                            } else {
                              removeVendor(vendorIndex);
                            }
                          }}
                          disabled={isReadOnly}
                          className='mt-1 border-blue-500/50 data-[state=checked]:bg-blue-600'
                        />
                        <div className='flex-1'>
                          <label
                            htmlFor={`pt-${pt.value}`}
                            className={cn(
                              'cursor-pointer select-none',
                              isReadOnly && 'cursor-default'
                            )}
                          >
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold'>
                                {pt.label}
                              </span>
                              <Badge
                                variant='outline'
                                className='border-blue-500/20 bg-blue-500/5 px-1 py-0 text-[10px] text-blue-600'
                              >
                                {pt.value}
                              </Badge>
                            </div>
                            <p className='text-muted-foreground mt-0.5 text-xs font-normal'>
                              {pt.description}
                            </p>
                          </label>
                        </div>
                      </div>

                      {isChecked &&
                        (pt.value === 'TOKEN' || pt.value === 'GAME_ITEM') && (
                          <div className='border-border/60 bg-muted/40 mt-4 space-y-4 rounded-lg border p-4 shadow-inner'>
                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
                              <div className='lg:col-span-2'>
                                <FormField
                                  control={form.control}
                                  name={`purchaseOptions.paymentVendor.${vendorIndex}.itemCode`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
                                        Select Item ({pt.value})
                                      </FormLabel>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        disabled={isReadOnly}
                                      >
                                        <FormControl>
                                          <SelectTrigger className='border-muted-foreground/20 bg-background h-10 w-full'>
                                            <SelectValue
                                              placeholder={`Choose ${pt.value} item`}
                                            />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-[300px]'>
                                          {itemOptions
                                            .filter((group) => {
                                              if (pt.value === 'TOKEN')
                                                return group.type === 'TOKEN';
                                              if (pt.value === 'GAME_ITEM')
                                                return (
                                                  group.type === 'GAME_ITEM'
                                                );
                                              return false;
                                            })
                                            .flatMap((group) => group.options)
                                            .map((opt) => (
                                              <SelectItem
                                                key={opt.value}
                                                value={opt.code}
                                              >
                                                <div className='flex w-full items-center gap-3 overflow-hidden py-0.5'>
                                                  {opt.icon && (
                                                    <div className='bg-muted relative h-6 w-6 shrink-0 overflow-hidden rounded-md border shadow-sm'>
                                                      <Image
                                                        src={opt.icon}
                                                        alt=''
                                                        fill
                                                        className='object-cover'
                                                        unoptimized
                                                      />
                                                    </div>
                                                  )}
                                                  <div className='flex flex-1 flex-col overflow-hidden text-left'>
                                                    <span className='truncate text-sm leading-tight font-semibold'>
                                                      {opt.label.split(' (')[0]}
                                                    </span>
                                                    <span className='text-muted-foreground truncate font-mono text-[10px]'>
                                                      {opt.code}
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
                              </div>
                              <div className='lg:col-span-1'>
                                <FormField
                                  control={form.control}
                                  name={`purchaseOptions.paymentVendor.${vendorIndex}.amount`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
                                        Amount
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min={0}
                                          className='border-muted-foreground/20 bg-background h-10 w-full'
                                          {...field}
                                          disabled={isReadOnly}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Contents Configuration - Refactored to fixed slots */}
        <Card className='flex h-full flex-col overflow-hidden border-none shadow-md'>
          <CardHeader className='bg-muted/30 flex flex-row items-center justify-between pb-4'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600'>
                <Package className='h-4 w-4' />
              </div>
              <div>
                <CardTitle className='text-lg font-bold'>Items</CardTitle>
                <CardDescription className='text-xs'>
                  Define rewards included in this package
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col p-6'>
            <div className='flex-1 rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 p-6 transition-all hover:shadow-md dark:border-emerald-800'>
              <div className='mb-4'>
                <h3 className='flex items-center gap-2 text-base font-bold text-emerald-700 dark:text-emerald-300'>
                  Items Configuration
                  <Badge
                    variant='default'
                    className='h-4 bg-emerald-600 text-[10px] uppercase hover:bg-emerald-600/90'
                  >
                    CONTENTS
                  </Badge>
                </h3>
                <p className='text-muted-foreground mt-0.5 text-xs'>
                  {itemFields.length === 0
                    ? 'Select at least one reward benefit'
                    : `${itemFields.length} benefit(s) configured`}
                </p>
              </div>

              <Separator className='mb-4 opacity-50' />

              <div className='grid gap-4'>
                {ITEM_BENEFIT_TYPES.map((bt) => {
                  const itemIndex = itemFields.findIndex(
                    (field) => itemTypeMap.get(field.configItemId) === bt.value
                  );
                  const isChecked = itemIndex !== -1;

                  return (
                    <div
                      key={bt.value}
                      className={cn(
                        'bg-background/60 rounded-lg border p-4 transition-all',
                        isChecked
                          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-sm'
                          : 'border-border/50'
                      )}
                    >
                      <div className='flex items-start gap-4'>
                        <Checkbox
                          id={`bt-${bt.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              // Find first item of this type to default
                              const firstItem = itemsData?.data?.find((i) => {
                                let t = i.type;
                                if (t === 'VIP') t = 'VIP_BENEFITS';
                                if (t === 'ADS') t = 'WATCH_ADS';
                                return t === bt.value;
                              });
                              appendItem({
                                configItemId: firstItem?.id || 0,
                                quantity: 1,
                                durationDays: 0
                              });
                            } else {
                              removeItem(itemIndex);
                            }
                          }}
                          disabled={isReadOnly}
                          className='mt-1 border-emerald-500/50 data-[state=checked]:bg-emerald-600'
                        />
                        <div className='flex-1'>
                          <label
                            htmlFor={`bt-${bt.value}`}
                            className={cn(
                              'cursor-pointer select-none',
                              isReadOnly && 'cursor-default'
                            )}
                          >
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-semibold'>
                                {bt.label}
                              </span>
                              <Badge
                                variant='outline'
                                className='border-emerald-500/20 bg-emerald-500/5 px-1 py-0 text-[10px] text-emerald-600'
                              >
                                {bt.value}
                              </Badge>
                            </div>
                            <p className='text-muted-foreground mt-0.5 text-xs font-normal'>
                              {bt.description}
                            </p>
                          </label>
                        </div>
                      </div>

                      {isChecked &&
                        (bt.value === 'TOKEN' || bt.value === 'GAME_ITEM') && (
                          <div className='mt-4 space-y-4 rounded-xl border border-emerald-100 bg-white/50 p-4 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20'>
                            <div className='grid grid-cols-1 gap-4 lg:grid-cols-12'>
                              <div className='lg:col-span-6'>
                                <FormField
                                  control={form.control}
                                  name={`items.${itemIndex}.configItemId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
                                        Select {bt.label}
                                      </FormLabel>
                                      <Select
                                        onValueChange={(v) =>
                                          field.onChange(Number(v))
                                        }
                                        value={field.value?.toString()}
                                        disabled={isReadOnly}
                                      >
                                        <FormControl>
                                          <SelectTrigger className='border-muted-foreground/20 bg-background h-10 w-full'>
                                            <SelectValue placeholder='Select item' />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-[300px]'>
                                          {itemOptions
                                            .filter(
                                              (group) => group.type === bt.value
                                            )
                                            .flatMap((group) => group.options)
                                            .map((opt) => (
                                              <SelectItem
                                                key={opt.value}
                                                value={opt.value.toString()}
                                              >
                                                <div className='flex w-full items-center gap-3 overflow-hidden py-0.5'>
                                                  {opt.icon && (
                                                    <div className='bg-muted relative h-6 w-6 shrink-0 overflow-hidden rounded-md border shadow-sm'>
                                                      <Image
                                                        src={opt.icon}
                                                        alt=''
                                                        fill
                                                        className='object-cover'
                                                        unoptimized
                                                      />
                                                    </div>
                                                  )}
                                                  <div className='flex flex-1 flex-col overflow-hidden text-left'>
                                                    <span className='truncate text-sm leading-tight font-semibold'>
                                                      {opt.label.split(' (')[0]}
                                                    </span>
                                                    <span className='text-muted-foreground truncate font-mono text-[10px]'>
                                                      {opt.code}
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
                              </div>
                              <div className='lg:col-span-3'>
                                <FormField
                                  control={form.control}
                                  name={`items.${itemIndex}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
                                        Quantity
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min={1}
                                          className='border-muted-foreground/20 bg-background h-10 w-full'
                                          {...field}
                                          disabled={isReadOnly}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className='lg:col-span-3'>
                                <FormField
                                  control={form.control}
                                  name={`items.${itemIndex}.durationDays`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
                                        Duration (Days)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min={0}
                                          className='border-muted-foreground/20 bg-background h-10 w-full'
                                          {...field}
                                          disabled={isReadOnly}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Section */}
      <Card className='border-none shadow-md'>
        <CardHeader className='bg-muted/30 flex flex-row items-center justify-between pb-4'>
          <div className='flex items-center gap-3'>
            <CardTitle className='text-lg font-bold'>Discount</CardTitle>
            <Switch
              checked={isDiscountEnabled}
              onCheckedChange={(checked) => {
                setIsDiscountEnabled(checked);
                // Initialize discount object if it doesn't exist yet but user enables it
                if (checked && !form.getValues('discount')) {
                  form.setValue('discount', {
                    gameId: form.getValues('gameId'),
                    name: '',
                    percent: 0,
                    isActive: true,
                    description: '',
                    condition: 'NONE',
                    startTime: null,
                    endTime: null,
                    urlImage: null,
                    discountIcon: null
                  });
                }
              }}
              disabled={isReadOnly}
            />
            <span className='text-sm font-medium'>Enable Discount</span>
          </div>
        </CardHeader>
        {isDiscountEnabled && (
          <CardContent className='p-6'>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='space-y-6 lg:col-span-2'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='discount.name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Flash sale, First buy, etc.'
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
                    name='discount.percent'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percent (%) *</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            min={0}
                            max={100}
                            {...field}
                            disabled={isReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='discount.condition'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isReadOnly}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Condition' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DiscountConditionEnum.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='flex items-end'>
                    <FormField
                      control={form.control}
                      name='discount.isActive'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center space-y-0 space-x-3 rounded-md border p-2.5 shadow-xs'>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isReadOnly}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none'>
                            <FormLabel>Is Active</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='discount.startTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
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
                    name='discount.endTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
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
                </div>

                <FormField
                  control={form.control}
                  name='discount.description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Extra info about discount'
                          className='h-20 resize-none'
                          {...field}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 gap-6'>
                <FormField
                  control={form.control}
                  name='discount.urlImage'
                  render={({ field }) => (
                    <ImageUploadArea
                      value={field.value}
                      onChange={field.onChange}
                      label='Discount Banner'
                      fieldName='discount.urlImage'
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name='discount.discountIcon'
                  render={({ field }) => (
                    <ImageUploadArea
                      value={field.value}
                      onChange={field.onChange}
                      label='Discount Icon'
                      fieldName='discount.discountIcon'
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Form Actions */}
      {!isReadOnly && (
        <div className='flex items-center justify-end gap-4 pb-12'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/config-package')}
            disabled={isSubmitting}
            className='min-w-[100px]'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='min-w-[140px] shadow-lg transition-transform active:scale-95'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </div>
      )}
    </Form>
  );
}
