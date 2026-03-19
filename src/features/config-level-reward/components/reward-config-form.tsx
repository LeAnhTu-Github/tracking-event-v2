'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from 'zod';
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
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useGames } from '@/hooks/use-games';
import itemService from '@/services/item.service';
import { useQuery } from '@tanstack/react-query';
import { LevelReward, ConfigType } from '../types';
import {
  useCreateLevelReward,
  useUpdateLevelReward
} from '../hooks/use-level-rewards';
import { Badge } from '@/components/ui/badge';
import { useLevels } from '@/features/config-level/hooks/use-levels';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Item } from '@/features/config-item/types';

import { PAYMENT_METHOD_INFO } from '../constants';
import { ActionSection } from './action-section';
import { ItemOptionLabel } from './item-option-label';
import { LevelSelector } from './level-selector';

// --- Schemas ---

const rewardItemSchema = z
  .object({
    type: z.string().min(1, 'Type is required'),
    amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
    codeItem: z.string().optional(),
    duration_days: z.preprocess(
      (v) => (v === '' || v === undefined || v === null ? null : v),
      z.coerce.number().min(0, 'Duration must be 0 or greater').nullable()
    )
  })
  .refine(
    (data) => {
      if (
        (data.type === 'TOKEN' || data.type === 'GAME_ITEM') &&
        !data.codeItem
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Item is required',
      path: ['codeItem']
    }
  );

const paymentVendorSchema = z
  .object({
    status: z.string().min(1, 'Status is required').default('active'),
    paymentType: z.string().min(1, 'Payment Type is required'),
    itemCode: z.string().optional(),
    amount: z.coerce.number().min(0, 'Amount must be 0 or greater'),
    duration_days: z.preprocess(
      (v) => (v === '' || v === undefined || v === null ? null : v),
      z.coerce.number().min(0, 'Duration must be 0 or greater').nullable()
    )
  })
  .refine(
    (data) => {
      if (
        (data.paymentType === 'TOKEN' || data.paymentType === 'ITEM') &&
        !data.itemCode
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Item is required',
      path: ['itemCode']
    }
  );

const rewardConfigFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['INDIVIDUAL', 'GENERAL']),
  gameId: z.string().min(1, 'Game ID is required'),
  percentBonus: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? 0 : v),
    z.coerce.number().min(0, 'Percent Bonus must be 0 or greater')
  ),
  rewardBonus: z.object({
    typeBonus: z.array(rewardItemSchema),
    paymentVendor: z.array(paymentVendorSchema)
  }),
  completionRewardDefault: z
    .array(rewardItemSchema)
    .min(1, 'At least one default reward is required'),
  levelNumbers: z.array(z.number()).default([])
});

type RewardConfigFormValues = z.infer<typeof rewardConfigFormSchema>;

export default function RewardConfigForm({
  initialData,
  isEdit = false
}: {
  initialData?: LevelReward;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const createMutation = useCreateLevelReward();
  const updateMutation = useUpdateLevelReward();
  const { data: gamesData } = useGames();

  const sanitizedInitialData = React.useMemo(() => {
    if (!initialData) {
      return {
        name: '',
        type: 'INDIVIDUAL' as ConfigType,
        gameId: '',
        percentBonus: 0,
        rewardBonus: {
          typeBonus: [],
          paymentVendor: []
        },
        completionRewardDefault: [],
        levelNumbers: []
      };
    }

    return {
      name: initialData.name || '',
      type: initialData.type || 'INDIVIDUAL',
      gameId: initialData.gameId || '',
      percentBonus: initialData.rewardConfig?.rewardBonus?.percentBonus ?? 0,
      rewardBonus: {
        typeBonus: initialData.rewardConfig?.rewardBonus?.typeBonus || [],
        paymentVendor:
          initialData.rewardConfig?.rewardBonus?.paymentVendor || []
      },
      completionRewardDefault:
        initialData.rewardConfig?.completionRewardDefault || [],
      levelNumbers: initialData.levelNumbers || []
    };
  }, [initialData]);

  const form = useForm<RewardConfigFormValues>({
    resolver: zodResolver(rewardConfigFormSchema) as any,
    defaultValues: sanitizedInitialData
  });

  // Set default gameId for new entries
  React.useEffect(() => {
    if (
      !isEdit &&
      gamesData &&
      gamesData.length > 0 &&
      !form.getValues('gameId')
    ) {
      form.setValue('gameId', gamesData[0]);
    }
  }, [isEdit, gamesData, form]);

  const { append: appendTypeBonus, remove: removeTypeBonus } = useFieldArray({
    control: form.control,
    name: 'rewardBonus.typeBonus'
  });

  const {
    fields: vendorFields,
    append: appendVendor,
    remove: removeVendor
  } = useFieldArray({
    control: form.control,
    name: 'rewardBonus.paymentVendor'
  });

  const { append: appendCompletionReward, remove: removeCompletionReward } =
    useFieldArray({
      control: form.control,
      name: 'completionRewardDefault'
    });

  const watchType = form.watch('type');
  const watchGameId = form.watch('gameId');
  const watchVendors = form.watch('rewardBonus.paymentVendor');
  const watchTypeBonus = form.watch('rewardBonus.typeBonus');
  const watchCompletionRewards = form.watch('completionRewardDefault');

  // Fetch items based on gameId
  const { data: items = [] } = useQuery<Item[]>({
    queryKey: ['items', watchGameId],
    queryFn: async () => {
      const res = await itemService.getItems({ gameId: watchGameId });
      return res.data || [];
    },
    enabled: !!watchGameId
  });

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, Item[]> = {};
    (items || []).forEach((item) => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });
    return groups;
  }, [items]);

  // Fetch levels based on gameId for MultiSelect
  const { data: levelsData } = useLevels({
    gameId: watchGameId,
    page: 0,
    size: 1000
  });

  const levelOptions = React.useMemo(() => {
    const seen = new Set();
    return (levelsData?.data || [])
      .filter((lvl) => {
        const duplicate = seen.has(lvl.levelNumber);
        seen.add(lvl.levelNumber);
        return !duplicate;
      })
      .map((lvl) => ({
        label: `Level ${lvl.levelNumber}`,
        value: lvl.levelNumber.toString()
      }));
  }, [levelsData]);

  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game,
      value: game
    }));
  }, [gamesData]);

  const toggleVendor = (type: string, checked: boolean) => {
    if (checked) {
      appendVendor({
        status: 'active',
        paymentType: type,
        itemCode: '',
        amount: 1,
        duration_days: null
      });
    } else {
      const index = watchVendors.findIndex((v) => v.paymentType === type);
      if (index !== -1) {
        removeVendor(index);
      }
    }
  };

  const toggleTypeBonus = (itemType: string, checked: boolean) => {
    if (checked) {
      appendTypeBonus({
        type: itemType,
        amount: 1,
        codeItem: '',
        duration_days: null
      });
    } else {
      const index = watchTypeBonus.findIndex((v) => v.type === itemType);
      if (index !== -1) {
        removeTypeBonus(index);
      }
    }
  };

  const toggleCompletionReward = (itemType: string, checked: boolean) => {
    if (checked) {
      appendCompletionReward({
        type: itemType,
        amount: 1,
        codeItem: '',
        duration_days: null
      });
    } else {
      const index = watchCompletionRewards.findIndex(
        (v) => v.type === itemType
      );
      if (index !== -1) {
        removeCompletionReward(index);
      }
    }
  };

  async function onSubmit(values: RewardConfigFormValues) {
    const payload = {
      name: values.name,
      type: values.type,
      gameId: values.gameId,
      levelNumbers: values.type === 'INDIVIDUAL' ? values.levelNumbers : [],
      rewardConfig: {
        rewardBonus: {
          percentBonus: values.percentBonus,
          typeBonus: values.rewardBonus.typeBonus,
          paymentVendor: values.rewardBonus.paymentVendor
        },
        completionRewardDefault: values.completionRewardDefault
      }
    };

    try {
      if (isEdit && initialData?.id) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.push('/dashboard/config-level-reward');
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='space-y-6'>
        {/* ── Basic Configuration ── */}
        <Card className='border-muted-foreground/10 shadow-sm'>
          <CardHeader>
            <CardTitle className='text-base font-bold'>
              Basic Configuration
            </CardTitle>
            <CardDescription>
              General settings for this reward configuration
            </CardDescription>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                    Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='w-full'
                      placeholder='Enter reward name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                    Type <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='INDIVIDUAL'>INDIVIDUAL</SelectItem>
                      <SelectItem value='GENERAL'>GENERAL</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='gameId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                    Game ID <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEdit}
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
              name='percentBonus'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-muted-foreground text-xs font-bold tracking-wider uppercase'>
                    Percent Bonus <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className='w-full'
                      type='number'
                      placeholder='0'
                      min={0}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {watchType === 'INDIVIDUAL' && (
          <Card className='border-blue-200 bg-blue-50/30 shadow-sm transition-all dark:border-blue-800 dark:bg-blue-950/10'>
            <CardHeader>
              <CardTitle className='text-base font-bold'>
                Level Numbers
              </CardTitle>
              <CardDescription className='text-xs'>
                Select levels that will apply this custom reward
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name='levelNumbers'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <LevelSelector
                        levels={levelOptions}
                        value={field.value || []}
                        onChange={(vals) => field.onChange(vals)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-1'>
          {/* ── Type Bonus ── */}
          <ActionSection
            title='Type Bonus'
            description='Additional rewards granted upon level completion'
            badge='Bonus'
            variant='blue'
          >
            <div className='grid grid-cols-1 gap-4'>
              {['VIP_BENEFITS', 'WATCH_ADS', 'TOKEN', 'ITEM'].map((cat) => {
                const catInfo = PAYMENT_METHOD_INFO[cat];
                const bonusIndex = watchTypeBonus.findIndex(
                  (v) => v.type === catInfo.itemType
                );
                const isChecked = bonusIndex !== -1;
                const filteredItems = items.filter(
                  (item) => item.type === catInfo.itemType
                );

                return (
                  <div
                    key={cat}
                    className={cn(
                      'bg-background/60 rounded-lg border transition-all',
                      isChecked
                        ? 'border-blue-400 bg-blue-50/10 shadow-sm'
                        : 'border-border/50'
                    )}
                  >
                    <div className='flex items-start gap-3 p-4'>
                      <Checkbox
                        id={`bonus-${cat}`}
                        checked={isChecked}
                        onCheckedChange={(c) =>
                          toggleTypeBonus(catInfo.itemType, !!c)
                        }
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor={`bonus-${cat}`}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold'>
                              {catInfo.label}
                            </span>
                            <Badge
                              variant='outline'
                              className='border-blue-200 bg-blue-100/50 text-[10px] text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                            >
                              {catInfo.itemType}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mt-0.5 text-xs'>
                            {catInfo.description}
                          </p>
                        </Label>

                        {isChecked && (
                          <div className='bg-muted/40 mt-4 grid grid-cols-1 gap-4 rounded-lg border border-blue-200/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
                            {(catInfo.itemType === 'TOKEN' ||
                              catInfo.itemType === 'GAME_ITEM') && (
                              <FormField
                                control={form.control}
                                name={`rewardBonus.typeBonus.${bonusIndex}.codeItem`}
                                render={({ field: itmField }) => (
                                  <FormItem>
                                    <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                      Select Item
                                    </FormLabel>
                                    <Select
                                      onValueChange={itmField.onChange}
                                      value={itmField.value || ''}
                                    >
                                      <FormControl>
                                        <SelectTrigger className='bg-background h-8 w-full text-xs'>
                                          <SelectValue placeholder='Select item' />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className='max-h-[300px]'>
                                        {filteredItems.map((item) => (
                                          <SelectItem
                                            key={item.itemCode}
                                            value={item.itemCode}
                                          >
                                            <ItemOptionLabel item={item} />
                                          </SelectItem>
                                        ))}
                                        {filteredItems.length === 0 && (
                                          <div className='text-muted-foreground p-4 text-center text-xs'>
                                            No items of type {catInfo.itemType}{' '}
                                            found
                                          </div>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            )}
                            {(catInfo.itemType === 'TOKEN' ||
                              catInfo.itemType === 'GAME_ITEM') && (
                              <FormField
                                control={form.control}
                                name={`rewardBonus.typeBonus.${bonusIndex}.amount`}
                                render={({ field: aField }) => (
                                  <FormItem>
                                    <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                      Amount
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type='number'
                                        min={0}
                                        className='bg-background h-8 w-full text-xs'
                                        {...aField}
                                        value={aField.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                            <FormField
                              control={form.control}
                              name={`rewardBonus.typeBonus.${bonusIndex}.duration_days`}
                              render={({ field: dField }) => (
                                <FormItem>
                                  <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                    Duration (Days)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      min={0}
                                      className='bg-background h-8 w-full text-xs'
                                      placeholder='Infinite'
                                      {...dField}
                                      value={dField.value ?? ''}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ActionSection>

          {/* ── Payment Vendor ── */}
          <ActionSection
            title='Payment Vendor Methods'
            description='Configure conditional rewards based on user payment or ad actions'
            badge='Vendor'
            variant='green'
          >
            <div className='grid grid-cols-1 gap-4'>
              {['VIP_BENEFITS', 'WATCH_ADS', 'TOKEN', 'ITEM'].map((pt) => {
                const ptInfo = PAYMENT_METHOD_INFO[pt];
                const vendorIndex = watchVendors.findIndex(
                  (v) => v.paymentType === pt
                );
                const isChecked = vendorIndex !== -1;

                // Filter items by the type defined in PAYMENT_METHOD_INFO
                const filteredItems = items.filter(
                  (item) => item.type === ptInfo.itemType
                );

                return (
                  <div
                    key={pt}
                    className={cn(
                      'bg-background/60 rounded-lg border transition-all',
                      isChecked
                        ? 'border-green-400 bg-green-50/10 shadow-sm'
                        : 'border-border/50'
                    )}
                  >
                    <div className='flex items-start gap-3 p-4'>
                      <Checkbox
                        id={`vendor-${pt}`}
                        checked={isChecked}
                        onCheckedChange={(c) => toggleVendor(pt, !!c)}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor={`vendor-${pt}`}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold'>
                              {ptInfo.label}
                            </span>
                            <Badge
                              variant='outline'
                              className='border-green-200 bg-green-100/50 text-[10px] text-green-700 dark:bg-green-900/20 dark:text-green-300'
                            >
                              {pt}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mt-0.5 text-xs'>
                            {ptInfo.description}
                          </p>
                        </Label>

                        {isChecked &&
                          (ptInfo.itemType === 'TOKEN' ||
                            ptInfo.itemType === 'GAME_ITEM') && (
                            <div className='bg-muted/40 mt-4 grid grid-cols-1 gap-4 rounded-lg border border-green-200/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
                              {(ptInfo.itemType === 'TOKEN' ||
                                ptInfo.itemType === 'GAME_ITEM') && (
                                <FormField
                                  control={form.control}
                                  name={`rewardBonus.paymentVendor.${vendorIndex}.itemCode`}
                                  render={({ field: icField }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                        Select Item
                                      </FormLabel>
                                      <Select
                                        onValueChange={icField.onChange}
                                        value={icField.value || ''}
                                      >
                                        <FormControl>
                                          <SelectTrigger className='bg-background h-8 w-full text-xs'>
                                            <SelectValue placeholder='Select item' />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='max-h-[300px]'>
                                          {filteredItems.map((item) => (
                                            <SelectItem
                                              key={item.itemCode}
                                              value={item.itemCode}
                                            >
                                              <ItemOptionLabel item={item} />
                                            </SelectItem>
                                          ))}
                                          {filteredItems.length === 0 && (
                                            <div className='text-muted-foreground p-4 text-center text-xs'>
                                              No items of type {ptInfo.itemType}{' '}
                                              found
                                            </div>
                                          )}
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                              )}
                              {(ptInfo.itemType === 'TOKEN' ||
                                ptInfo.itemType === 'GAME_ITEM') && (
                                <FormField
                                  control={form.control}
                                  name={`rewardBonus.paymentVendor.${vendorIndex}.amount`}
                                  render={({ field: aField }) => (
                                    <FormItem>
                                      <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                        Amount
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type='number'
                                          min={0}
                                          className='bg-background h-8 w-full text-xs'
                                          {...aField}
                                          value={aField.value ?? ''}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ActionSection>

          {/* ── Completion Reward Default ── */}
          <ActionSection
            title={
              <span>
                Completion Reward Default{' '}
                <span className='text-destructive'>*</span>
              </span>
            }
            description='Standard rewards given to all users upon completing the level'
            badge='Default'
            variant='orange'
          >
            <div className='grid grid-cols-1 gap-4'>
              {['VIP_BENEFITS', 'WATCH_ADS', 'TOKEN', 'ITEM'].map((cat) => {
                const catInfo = PAYMENT_METHOD_INFO[cat];
                const compIndex = watchCompletionRewards.findIndex(
                  (v) => v.type === catInfo.itemType
                );
                const isChecked = compIndex !== -1;
                const filteredItems = items.filter(
                  (item) => item.type === catInfo.itemType
                );

                return (
                  <div
                    key={cat}
                    className={cn(
                      'bg-background/60 rounded-lg border transition-all',
                      isChecked
                        ? 'border-orange-400 bg-orange-50/10 shadow-sm'
                        : 'border-border/50'
                    )}
                  >
                    <div className='flex items-start gap-3 p-4'>
                      <Checkbox
                        id={`comp-${cat}`}
                        checked={isChecked}
                        onCheckedChange={(c) =>
                          toggleCompletionReward(catInfo.itemType, !!c)
                        }
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <Label
                          htmlFor={`comp-${cat}`}
                          className='cursor-pointer'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold'>
                              {catInfo.label}
                            </span>
                            <Badge
                              variant='outline'
                              className='border-orange-200 bg-orange-100/50 text-[10px] text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                            >
                              {catInfo.itemType}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mt-0.5 text-xs'>
                            {catInfo.description}
                          </p>
                        </Label>

                        {isChecked && (
                          <div className='bg-muted/40 mt-4 grid grid-cols-1 gap-4 rounded-lg border border-orange-200/50 p-4 sm:grid-cols-2 lg:grid-cols-4'>
                            {(catInfo.itemType === 'TOKEN' ||
                              catInfo.itemType === 'GAME_ITEM') && (
                              <FormField
                                control={form.control}
                                name={`completionRewardDefault.${compIndex}.codeItem`}
                                render={({ field: itmField }) => (
                                  <FormItem>
                                    <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                      Select Item
                                    </FormLabel>
                                    <Select
                                      onValueChange={itmField.onChange}
                                      value={itmField.value || ''}
                                    >
                                      <FormControl>
                                        <SelectTrigger className='bg-background h-8 w-full text-xs'>
                                          <SelectValue placeholder='Select item' />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className='max-h-[300px]'>
                                        {filteredItems.map((item) => (
                                          <SelectItem
                                            key={item.itemCode}
                                            value={item.itemCode}
                                          >
                                            <ItemOptionLabel item={item} />
                                          </SelectItem>
                                        ))}
                                        {filteredItems.length === 0 && (
                                          <div className='text-muted-foreground p-4 text-center text-xs'>
                                            No items of type {catInfo.itemType}{' '}
                                            found
                                          </div>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            )}
                            {(catInfo.itemType === 'TOKEN' ||
                              catInfo.itemType === 'GAME_ITEM') && (
                              <FormField
                                control={form.control}
                                name={`completionRewardDefault.${compIndex}.amount`}
                                render={({ field: aField }) => (
                                  <FormItem>
                                    <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                      Amount
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type='number'
                                        min={0}
                                        className='bg-background h-8 w-full text-xs'
                                        {...aField}
                                        value={aField.value ?? ''}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                            <FormField
                              control={form.control}
                              name={`completionRewardDefault.${compIndex}.duration_days`}
                              render={({ field: dField }) => (
                                <FormItem>
                                  <FormLabel className='text-muted-foreground text-[10px] font-bold uppercase'>
                                    Duration (Days)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      min={0}
                                      className='bg-background h-8 w-full text-xs'
                                      placeholder='Infinite'
                                      {...dField}
                                      value={dField.value ?? ''}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ActionSection>
        </div>

        <div className='flex items-center justify-end gap-4 border-t pt-4 pb-12'>
          <Button
            type='button'
            variant='ghost'
            className='text-muted-foreground hover:text-foreground'
            onClick={() => router.push('/dashboard/config-level-reward')}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={createMutation.isPending || updateMutation.isPending}
            className='min-w-[160px] bg-blue-600 font-bold shadow-md hover:bg-blue-700'
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <div className='flex items-center gap-2'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Processing...
              </div>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Configuration'
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
