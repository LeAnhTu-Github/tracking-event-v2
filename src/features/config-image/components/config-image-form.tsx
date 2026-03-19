'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
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
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ConfigImage,
  ConfigActionGroup,
  ConfigImageType,
  ActionType,
  PaymentType,
  ActionConfigPaymentVendor,
  ActionConfigItem,
  CreateConfigImagePayload
} from '@/types/config-image.type';
import { useGames } from '@/hooks/use-games';
import imageService from '@/services/image.service';
import itemService from '@/services/item.service';
import { Item } from '@/features/config-item/types';
import { Loader2, X, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────

const PAYMENT_TYPES: {
  value: PaymentType;
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
  { value: 'ITEM', label: 'Item', description: 'Pay with inventory items' }
];

const PLAY_PAYMENT_TYPES: PaymentType[] = [
  'VIP_BENEFITS',
  'WATCH_ADS',
  'TOKEN',
  'ITEM'
];
const DOWNLOAD_PAYMENT_TYPES: PaymentType[] = [
  'VIP_BENEFITS',
  'WATCH_ADS',
  'TOKEN',
  'ITEM'
];

type VendorMap = Partial<Record<PaymentType, ActionConfigPaymentVendor>>;

interface ActionSectionState {
  vendors: Record<string, ActionConfigPaymentVendor>;
}

interface FormState {
  type: ConfigImageType;
  name: string;
  gameId: string;
  play: ActionSectionState;
  download: ActionSectionState;
  playImagesIds: number[];
}

// ─── Helper ─────────────────────────────────────────────────────────────────

const buildDefaultVendor = (pt: PaymentType): ActionConfigPaymentVendor => ({
  paymentType: pt,
  status: 'active',
  ...(pt === 'TOKEN' || pt === 'ITEM' ? { itemCode: '', amount: 0 } : {})
});

const buildActionItems = (
  play: ActionSectionState,
  download: ActionSectionState
): ActionConfigItem[] => {
  const items: ActionConfigItem[] = [];

  if (Object.keys(play.vendors).length > 0) {
    items.push({
      type: 'PLAY',
      paymentVendor: Object.values(play.vendors)
    });
  }

  if (Object.keys(download.vendors).length > 0) {
    items.push({
      type: 'DOWNLOAD',
      paymentVendor: Object.values(download.vendors)
    });
  }

  return items;
};

const initFromExisting = (group: ConfigActionGroup): FormState => {
  const config = group.action;
  const playAction = config.actionConfig.actions.find((a) => a.type === 'PLAY');
  const downloadAction = config.actionConfig.actions.find(
    (a) => a.type === 'DOWNLOAD'
  );

  const vendorMap = (action?: ActionConfigItem): VendorMap => {
    if (!action) return {};
    return action.paymentVendor.reduce<VendorMap>((acc, v) => {
      acc[v.paymentType as PaymentType] = v;
      return acc;
    }, {});
  };

  return {
    type: (group.type as ConfigImageType) || 'GENERAL',
    name: group.name || '',
    gameId: group.gameId || '',
    play: { vendors: vendorMap(playAction) },
    download: { vendors: vendorMap(downloadAction) },
    playImagesIds: group.configs
      .map((c) => c.playImagesId)
      .filter((id): id is number => id !== null)
  };
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function VendorFieldsEditor({
  vendor,
  items,
  onChange
}: {
  vendor: ActionConfigPaymentVendor;
  items: Item[];
  onChange: (v: ActionConfigPaymentVendor) => void;
}) {
  const pt = vendor.paymentType;
  if (pt !== 'TOKEN' && pt !== 'ITEM') return null;

  const filteredItems = items.filter((item) => {
    if (pt === 'TOKEN') return item.type === 'TOKEN';
    if (pt === 'ITEM') return item.type === 'GAME_ITEM';
    return false;
  });

  return (
    <div className='bg-muted/40 border-border/60 mt-3 space-y-4 rounded-lg border p-4 shadow-inner'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <Label className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
            Select Item ({pt})
          </Label>
          <Select
            value={vendor.itemCode || ''}
            onValueChange={(val) => onChange({ ...vendor, itemCode: val })}
          >
            <SelectTrigger className='bg-background border-muted-foreground/20 focus:ring-primary/20 h-10 text-sm'>
              <SelectValue placeholder={`Choose ${pt} item`} />
            </SelectTrigger>
            <SelectContent className='max-h-[300px]'>
              {filteredItems.map((item) => (
                <SelectItem key={item.itemCode} value={item.itemCode}>
                  <div className='flex items-center gap-3 py-0.5'>
                    {item.urlIcon && (
                      <img
                        src={item.urlIcon}
                        alt=''
                        className='bg-muted h-6 w-6 rounded-md object-cover shadow-sm'
                      />
                    )}
                    <div className='flex flex-col text-left'>
                      <span className='text-sm leading-tight font-semibold'>
                        {item.name}
                      </span>
                      <span className='text-muted-foreground font-mono text-[10px]'>
                        {item.itemCode}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
              {filteredItems.length === 0 && (
                <p className='text-muted-foreground bg-muted/20 mx-2 my-1 rounded-md p-4 text-center text-xs italic'>
                  No {pt === 'TOKEN' ? 'TOKEN' : 'GAME_ITEM'} items found
                </p>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label className='text-muted-foreground text-[10px] font-bold tracking-wider uppercase'>
            Amount
          </Label>
          <Input
            type='number'
            min={0}
            value={vendor.amount ?? ''}
            placeholder='0'
            className='bg-background border-muted-foreground/20 focus:ring-primary/20 h-10 text-sm'
            onChange={(e) =>
              onChange({ ...vendor, amount: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
      </div>
    </div>
  );
}

function ActionSection({
  title,
  actionType,
  allowedPaymentTypes,
  state,
  items,
  onChange
}: {
  title: string;
  actionType: 'PLAY' | 'DOWNLOAD';
  allowedPaymentTypes: PaymentType[];
  state: ActionSectionState;
  items: Item[];
  onChange: (s: ActionSectionState) => void;
}) {
  const toggleVendor = (pt: PaymentType, checked: boolean) => {
    const newVendors = { ...state.vendors };
    if (checked) {
      newVendors[pt] = buildDefaultVendor(pt);
    } else {
      delete newVendors[pt];
    }
    onChange({ ...state, vendors: newVendors });
  };

  const updateVendor = (pt: PaymentType, v: ActionConfigPaymentVendor) => {
    onChange({ ...state, vendors: { ...state.vendors, [pt]: v } });
  };

  const actionColor =
    actionType === 'PLAY'
      ? 'bg-linear-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800'
      : 'bg-linear-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800';

  const badgeVariant = actionType === 'PLAY' ? 'default' : 'secondary';

  return (
    <Card
      className={cn(
        'border bg-linear-to-br shadow-sm transition-all',
        actionColor
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div>
              <CardTitle className='flex items-center gap-2 text-base'>
                <span className='text-base font-bold'>{title}</span>
                <Badge
                  variant={badgeVariant}
                  className='h-4 text-[10px] uppercase'
                >
                  {actionType}
                </Badge>
              </CardTitle>
              <CardDescription className='mt-0.5 text-xs'>
                {Object.keys(state.vendors).length === 0
                  ? 'Select at least one payment method'
                  : `${Object.keys(state.vendors).length} method(s) configured`}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-3 pt-0'>
        <Separator className='opacity-50' />
        <div className='grid gap-3'>
          {allowedPaymentTypes.map((pt) => {
            const ptInfo = PAYMENT_TYPES.find((p) => p.value === pt)!;
            const isChecked = !!state.vendors[pt];

            return (
              <div
                key={pt}
                className={cn(
                  'bg-background/60 rounded-lg border p-3 transition-colors',
                  isChecked
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : 'border-border/50'
                )}
              >
                <div className='flex items-start gap-3'>
                  <Checkbox
                    id={`${actionType}-${pt}`}
                    checked={isChecked}
                    onCheckedChange={(c) => toggleVendor(pt, !!c)}
                    className='mt-1'
                  />
                  <div className='flex-1'>
                    <label
                      htmlFor={`${actionType}-${pt}`}
                      className='cursor-pointer'
                    >
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold'>
                          {ptInfo.label}
                        </span>
                        <Badge
                          variant='outline'
                          className='border-primary/20 bg-primary/5 text-primary px-1 py-0 text-[10px]'
                        >
                          {pt}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground mt-0.5 text-xs'>
                        {ptInfo.description}
                      </p>
                    </label>

                    {isChecked && state.vendors[pt] && (
                      <VendorFieldsEditor
                        vendor={state.vendors[pt]!}
                        items={items}
                        onChange={(v) => updateVendor(pt, v)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Image Selector ──────────────────────────────────────────────────────────

interface ImageItem {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string;
  type?: string;
  gameId?: string;
}

function ImageSelector({
  selectedIds,
  gameId,
  onChange
}: {
  selectedIds: number[];
  gameId?: string;
  onChange: (ids: number[]) => void;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalItems, setTotalItems] = useState(0);

  const fetchImages = () => {
    setLoading(true);
    const filters: any = gameId ? { gameId } : {};
    if (search) {
      filters.keyword = search;
    }

    imageService
      .getMedia(filters, pageIndex, pageSize)
      .then((res: any) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];
        setImages(
          items.map((item: any) => ({
            id: item.id,
            imageUrl: item.imageUrl || '',
            thumbnailUrl: item.thumbnailUrl,
            type: item.type,
            gameId: item.gameId
          }))
        );
        setTotalItems(res?.totalRecords || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchImages();
  }, [gameId, pageIndex, pageSize]);

  // Handle search - ideally debounce it, but for now simple button or enter
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setPageIndex(1);
      fetchImages();
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder='Search by ID or keyword (Enter to search)...'
            className='h-9 pr-10 text-sm'
          />
          <Button
            size='icon'
            variant='ghost'
            className='text-muted-foreground hover:text-foreground absolute top-0 right-0 h-9 w-9'
            onClick={() => {
              setPageIndex(1);
              fetchImages();
            }}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.3-4.3' />
            </svg>
          </Button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-muted-foreground text-xs whitespace-nowrap'>
            Show
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(1);
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={String(pageSize)} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedIds.length > 0 && (
          <Badge variant='secondary' className='h-6'>
            {selectedIds.length} selected
          </Badge>
        )}
      </div>

      {loading ? (
        <div className='bg-muted/10 flex items-center justify-center rounded-lg border py-12'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='text-primary/60 h-8 w-8 animate-spin' />
            <span className='text-muted-foreground text-xs font-medium'>
              Loading images...
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className='bg-muted/5 grid max-h-96 grid-cols-5 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10'>
            {images.map((img) => {
              const isSelected = selectedIds.includes(img.id);
              const thumb = img.thumbnailUrl || img.imageUrl;

              return (
                <button
                  key={img.id}
                  type='button'
                  onClick={() => toggle(img.id)}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-md border-2 transition-all',
                    isSelected
                      ? 'border-primary ring-primary/30 ring-2'
                      : 'hover:border-primary/40 border-transparent'
                  )}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={`Image ${img.id}`}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <div className='bg-muted flex h-full w-full items-center justify-center'>
                      <ImageIcon className='text-muted-foreground h-5 w-5' />
                    </div>
                  )}
                  <div className='absolute right-0 bottom-0 left-0 bg-black/60 px-1 py-0.5'>
                    <p className='truncate text-center text-[10px] text-white'>
                      #{img.id}
                    </p>
                  </div>
                  {isSelected && (
                    <div className='bg-primary absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-white shadow-sm'>
                      <span className='text-[10px] font-bold'>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
            {images.length === 0 && (
              <div className='col-span-full py-12 text-center'>
                <ImageIcon className='text-muted-foreground/30 mx-auto mb-2 h-10 w-10' />
                <p className='text-muted-foreground text-sm'>
                  No images found for this game
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className='flex items-center justify-between px-2'>
            <div className='text-muted-foreground text-xs'>
              Total: <span className='font-medium'>{totalItems}</span> images
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1 || loading}
                className='h-8 px-2 lg:px-3'
              >
                Previous
              </Button>
              <div className='flex min-w-[32px] items-center justify-center text-xs font-medium'>
                {pageIndex} / {Math.max(1, totalPages)}
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex >= totalPages || loading}
                className='h-8 px-2 lg:px-3'
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedIds.length > 0 && (
        <div className='border-t pt-2'>
          <p className='text-muted-foreground mb-2 text-[10px] font-bold tracking-wider uppercase'>
            Selected Collections
          </p>
          <div className='flex flex-wrap gap-1.5'>
            {selectedIds.map((id) => (
              <Badge
                key={id}
                variant='outline'
                className='bg-primary/5 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer gap-1.5 pr-1 text-xs transition-colors'
                onClick={() => toggle(id)}
              >
                <span className='font-mono text-[10px]'>#{id}</span>
                <X className='h-3 w-3' />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form ───────────────────────────────────────────────────────────────

interface ConfigImageFormProps {
  initialData?: ConfigActionGroup;
  onSubmit: (payload: CreateConfigImagePayload) => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
}

export function ConfigImageForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  mode
}: ConfigImageFormProps) {
  const router = useRouter();
  const { data: games } = useGames();

  const [form, setForm] = useState<FormState>(() =>
    initialData
      ? initFromExisting(initialData)
      : {
          type: 'GENERAL',
          name: '',
          gameId: '',
          play: { vendors: {} },
          download: { vendors: {} },
          playImagesIds: []
        }
  );

  const [items, setItems] = useState<Item[]>([]);

  // Load items when gameId changes
  useEffect(() => {
    if (form.gameId) {
      itemService
        .getItems({ gameId: form.gameId })
        .then((res: any) => {
          const data = Array.isArray(res) ? res : res?.data || [];
          setItems(data);
        })
        .catch((err) => {
          console.error('Failed to fetch items:', err);
          setItems([]);
        });
    } else {
      setItems([]);
    }
  }, [form.gameId]);

  // Sync with initialData when it becomes available
  useEffect(() => {
    if (initialData) {
      setForm(initFromExisting(initialData));
    }
  }, [initialData]);

  // Handle gameId-dependent resets
  useEffect(() => {
    if (!form.gameId) return;

    // In create mode, any change to gameId should clear selection
    if (mode === 'create') {
      setForm((prev) => ({ ...prev, playImagesIds: [] }));
    }
    // In edit mode, we don't clear unless it's different from original (if gameId was editable)
    else if (
      mode === 'edit' &&
      initialData &&
      form.gameId !== initialData.gameId
    ) {
      setForm((prev) => ({ ...prev, playImagesIds: [] }));
    }
  }, [form.gameId, mode, initialData?.gameId]);

  // Set default gameId in create mode
  useEffect(() => {
    if (mode === 'create' && !form.gameId && games && games.length > 0) {
      setForm((prev) => ({ ...prev, gameId: games[0] }));
    }
  }, [mode, form.gameId, games]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check basics
    if (!form.name.trim()) {
      toast.error('Please enter a configuration name');
      return;
    }
    if (!form.gameId) {
      toast.error('Please select a game');
      return;
    }

    const actions = buildActionItems(form.play, form.download);

    // Validation: Both actions are effectively required to have methods per user request
    if (Object.keys(form.play.vendors).length === 0) {
      toast.error('Please select at least one payment method for Play Action');
      return;
    }
    if (Object.keys(form.download.vendors).length === 0) {
      toast.error(
        'Please select at least one payment method for Download Action'
      );
      return;
    }

    const payload: CreateConfigImagePayload = {
      type: form.type,
      name: form.name,
      gameId: form.gameId,
      actionConfig: { actions }
    };

    if (form.type === 'INDIVIDUAL') {
      if (form.playImagesIds.length === 0) {
        toast.error('Please select at least one image for INDIVIDUAL type');
        return;
      }
      payload.playImagesIds = form.playImagesIds;
    }

    onSubmit(payload);
  };

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* ── Basic Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Basic Information</CardTitle>
          <CardDescription>
            Set the general settings for this configuration
          </CardDescription>
        </CardHeader>
        <CardContent className='grid grid-cols-1 gap-6'>
          {/* Basic Fields Stacked Full Width */}
          <div className='grid gap-6 sm:grid-cols-2'>
            {/* Type */}
            <div className='space-y-2'>
              <Label htmlFor='config-type'>
                Config Type <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.type}
                onValueChange={(v) => set('type', v as ConfigImageType)}
              >
                <SelectTrigger id='config-type' className='w-full'>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='GENERAL'>
                    <div>
                      <p className='font-medium'>GENERAL</p>
                    </div>
                  </SelectItem>
                  <SelectItem value='INDIVIDUAL'>
                    <div>
                      <p className='font-medium'>INDIVIDUAL</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Game ID */}
            <div className='space-y-2'>
              <Label htmlFor='game-id'>
                Game <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.gameId}
                onValueChange={(v) => set('gameId', v)}
                disabled={mode === 'edit'}
              >
                <SelectTrigger id='game-id' className='w-full'>
                  <SelectValue placeholder='Select game' />
                </SelectTrigger>
                <SelectContent>
                  {games?.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Name - Full Width Below */}
          <div className='space-y-2'>
            <Label htmlFor='config-name'>
              Config Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='config-name'
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder='e.g. Default Play Config'
              className='w-full'
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Action Config ── */}
      <div className='space-y-3'>
        <div>
          <h3 className='text-sm font-semibold'>Action Configuration</h3>
          <p className='text-muted-foreground text-xs'>
            Configure PLAY and DOWNLOAD actions with their payment methods
          </p>
        </div>

        <div className='grid gap-4 lg:grid-cols-2'>
          <ActionSection
            title='Play Action'
            actionType='PLAY'
            allowedPaymentTypes={PLAY_PAYMENT_TYPES}
            state={form.play}
            items={items}
            onChange={(s) => set('play', s)}
          />
          <ActionSection
            title='Download Action'
            actionType='DOWNLOAD'
            allowedPaymentTypes={DOWNLOAD_PAYMENT_TYPES}
            state={form.download}
            items={items}
            onChange={(s) => set('download', s)}
          />
        </div>
      </div>

      {/* ── Image Selection (INDIVIDUAL only) ── */}
      {form.type === 'INDIVIDUAL' && (
        <Card className='border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <ImageIcon className='h-4 w-4 text-amber-600' />
              Image Selection
            </CardTitle>
            <CardDescription>
              Select one or more images this configuration applies to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageSelector
              selectedIds={form.playImagesIds}
              gameId={form.gameId}
              onChange={(ids) => set('playImagesIds', ids)}
            />
          </CardContent>
        </Card>
      )}

      {/* ── Actions ── */}
      <div className='flex items-center justify-end gap-3 border-t pt-4'>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/config-image')}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={isSubmitting || !form.name || !form.gameId}
        >
          {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          {mode === 'create' ? 'Create Config' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
