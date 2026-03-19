'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUploader } from '@/components/file-uploader';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { ImageSelector } from '@/components/image-selector';
import { levelService } from '@/services/level.service';
import { LevelCreatePayload } from '@/types/level.type';
import { useRouter } from 'next/navigation';
import imageService from '@/services/image.service';
import { Checkbox } from '@/components/ui/checkbox';
import { useGames } from '@/hooks/use-games';

const levelConfigSchema = z.object({
  gameId: z.string().min(1, 'Game ID is required'),
  levelNumber: z.coerce.number().min(1, 'Level number must be at least 1'),
  name: z.string().min(1, 'Name is required'),
  countdown: z.coerce.number().min(1, 'Countdown is required'),
  boardType: z.coerce.number().min(1, 'Board type is required'),
  boardSize: z.coerce.number().min(2, 'Board size must be at least 2'),
  emptyCount: z.coerce.number().min(0, 'Empty count is required'),
  hardLevel: z.enum(['EASY', 'MEDIUM', 'HARD']),
  isVideo: z.boolean().default(false),
  sexyLevel: z.coerce.number().min(0).max(5).default(1),
  mostPlayedCount: z.coerce.number().min(0, 'Most played count is required'),
  normalCount: z.coerce.number().min(0, 'Normal count is required'),
  vipCount: z.coerce.number().min(0, 'Vip count is required'),
  imagePool: z
    .array(
      z.object({
        id: z.number(),
        type: z.enum(['NORMAL', 'VIP'])
      })
    )
    .default([])
});

type LevelConfigFormValues = z.infer<typeof levelConfigSchema>;

const ImagePreview = ({
  url,
  className,
  children,
  emptyText = 'No image selected',
  hoverText
}: {
  url?: string;
  className?: string;
  children?: React.ReactNode;
  emptyText?: string;
  hoverText?: string;
}) => {
  return (
    <div
      className={cn(
        'group relative flex items-center justify-center overflow-hidden rounded-xl border shadow-sm transition-all duration-300',
        !url
          ? cn(
              'bg-muted/50 border-2 border-dashed transition-colors',
              hoverText &&
                'hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
            )
          : 'bg-background border-solid',
        className
      )}
    >
      {url ? (
        <>
          <Image
            src={url}
            alt='Preview'
            fill
            className='object-cover transition-transform duration-500 hover:scale-105'
            unoptimized
          />
          <div className='absolute inset-x-0 top-0 bottom-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </>
      ) : (
        <div
          className={cn(
            'text-muted-foreground/40 flex flex-col items-center gap-2 transition-colors',
            hoverText && 'group-hover:text-primary/70'
          )}
        >
          <div className='relative'>
            <ImageIcon
              className={cn(
                'h-12 w-12 stroke-[1.5] transition-all duration-300',
                hoverText && 'group-hover:scale-110 group-hover:rotate-3'
              )}
            />
            {hoverText && (
              <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                <Plus className='text-primary h-6 w-6' />
              </div>
            )}
          </div>
          <span
            className={cn(
              'text-xs font-medium transition-all duration-300',
              hoverText && 'group-hover:translate-y-0.5'
            )}
          >
            <span className={hoverText ? 'group-hover:hidden' : ''}>
              {emptyText}
            </span>
            {hoverText && (
              <span className='text-primary hidden group-hover:inline'>
                {hoverText}
              </span>
            )}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};

export default function LevelConfigForm({
  initialData,
  isEdit = false
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreviews, setImagePreviews] = React.useState<
    Record<number, string>
  >({});
  const { data: gamesData } = useGames();

  const gameOptions = React.useMemo(() => {
    return (gamesData || []).map((game: string) => ({
      label: game,
      value: game
    }));
  }, [gamesData]);

  const sanitizedInitialData = React.useMemo(() => {
    if (!initialData) {
      return {
        gameId: '',
        levelNumber: 1,
        name: '',
        countdown: 60,
        boardType: 1,
        boardSize: 4,
        emptyCount: 4,
        hardLevel: 'MEDIUM' as const,
        isVideo: false,
        sexyLevel: 1,
        mostPlayedCount: 0,
        normalCount: 0,
        vipCount: 0,
        imagePool: []
      };
    }

    return {
      gameId: initialData.gameId ?? '',
      levelNumber: initialData.levelNumber ?? 1,
      name: initialData.name ?? '',
      countdown: initialData.countdown ?? 60,
      boardType: initialData.boardType ?? 1,
      boardSize: initialData.boardSize ?? 4,
      emptyCount: initialData.emptyCount ?? 4,
      hardLevel: (initialData.hardLevel as any) ?? 'MEDIUM',
      isVideo: !!initialData.isVideo,
      sexyLevel: initialData.sexyLevel ?? 1,
      mostPlayedCount: initialData.mostPlayedCount ?? 0,
      normalCount: initialData.normalCount ?? 0,
      vipCount: initialData.vipCount ?? 0,
      imagePool: Array.isArray(initialData.imagePool)
        ? initialData.imagePool.map((item: any) => ({
            id: item.id,
            type: item.type ?? 'NORMAL'
          }))
        : []
    };
  }, [initialData]);

  const form = useForm<LevelConfigFormValues>({
    resolver: zodResolver(levelConfigSchema) as any,
    defaultValues: sanitizedInitialData
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'imagePool',
    keyName: 'rhf_id'
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(sanitizedInitialData);
    }
  }, [sanitizedInitialData, form]);

  const watchedImagePool = form.watch('imagePool');

  React.useEffect(() => {
    const idsToFetch = watchedImagePool
      .filter((item) => !imagePreviews[item.id])
      .map((item) => item.id);

    if (idsToFetch.length > 0) {
      idsToFetch.forEach((id) => {
        imageService
          .getMediaById(id)
          .then((res) => {
            setImagePreviews((prev) => ({
              ...prev,
              [id]: res.imageUrl || res.thumbnailUrl
            }));
          })
          .catch((err) => console.error(`Failed to fetch image ${id}`, err));
      });
    }
  }, [watchedImagePool]); // Only re-run when pool changes

  async function onSubmit(values: LevelConfigFormValues) {
    try {
      setIsSubmitting(true);

      const payload: LevelCreatePayload = {
        gameId: values.gameId,
        levelNumber: values.levelNumber,
        name: values.name,
        countdown: values.countdown,
        boardType: values.boardType,
        boardSize: values.boardSize,
        emptyCount: values.emptyCount,
        hardLevel: values.hardLevel,
        isVideo: values.isVideo,
        sexyLevel: values.sexyLevel,
        vipCount: values.vipCount,
        normalCount: values.normalCount,
        mostPlayedCount: values.mostPlayedCount,
        imagePool: values.imagePool.map((i) => ({ id: i.id, type: i.type }))
      };

      if (isEdit && initialData?.id) {
        await levelService.updateLevel(initialData.id, payload);
        toast.success('Level updated successfully');
      } else {
        await levelService.createLevel(payload);
        toast.success('Level created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['levels'] });
      if (isEdit && initialData?.id) {
        queryClient.invalidateQueries({ queryKey: ['level', initialData.id] });
      }

      router.push('/dashboard/config-level');
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to save level configuration');
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentGameId = form.watch('gameId');

  const handleSelectImages = (ids: number[]) => {
    const currentPool = form.getValues('imagePool');
    const currentIds = currentPool.map((i) => i.id);

    // Add new ones
    ids.forEach((id) => {
      if (!currentIds.includes(id)) {
        append({ id, type: 'NORMAL' });
      }
    });

    // Remove unselected ones
    const currentPoolLatest = form.getValues('imagePool');
    const indicesToRemove = currentPoolLatest
      .map((item, index) => (!ids.includes(item.id) ? index : -1))
      .filter((index) => index !== -1)
      .reverse(); // Remove in reverse to maintain indices

    indicesToRemove.forEach((idx) => remove(idx));
  };

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Basic Configuration</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='Enter level name' {...field} />
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
                    defaultValue={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger className='h-10 w-full'>
                        <SelectValue placeholder='Select a game' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gameOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name='levelNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Level Number <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='hardLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hard Level <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='h-10 w-full'>
                        <SelectValue placeholder='Select difficulty' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='EASY'>Easy</SelectItem>
                      <SelectItem value='MEDIUM'>Medium</SelectItem>
                      <SelectItem value='HARD'>Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Board & Gameplay</CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
            <FormField
              control={form.control}
              name='countdown'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Countdown <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='boardSize'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Board Size <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='emptyCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Empty Count <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='boardType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Board Type <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='sexyLevel'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexy Level</FormLabel>
                  <FormControl>
                    <Input type='number' min={0} max={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='normalCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Normal Count <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='vipCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vip Count <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='mostPlayedCount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Most Played Count{' '}
                    <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='isVideo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Is Video</FormLabel>
                  <div className='flex h-10 w-full items-center space-x-3 rounded-md border px-3 py-2'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='text-sm leading-none font-medium'>
                      Enable Video
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Image Pool</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm'>
                  Add from Media Library
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-3xl'>
                <DialogHeader>
                  <DialogTitle>Select Images</DialogTitle>
                </DialogHeader>
                <ImageSelector
                  gameId={currentGameId}
                  selectedIds={fields.map((f) => f.id)}
                  onChange={handleSelectImages}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
              {fields.map((field, index) => (
                <div
                  key={field.rhf_id}
                  className='group relative flex flex-col items-center space-y-2 rounded-lg border p-2'
                >
                  <ImagePreview
                    url={imagePreviews[field.id]}
                    className='h-32 w-full'
                  />
                  <div className='flex w-full gap-2'>
                    <FormField
                      control={form.control}
                      name={`imagePool.${index}.type`}
                      render={({ field: typeField }) => (
                        <Select
                          onValueChange={typeField.onChange}
                          value={typeField.value}
                        >
                          <FormControl>
                            <SelectTrigger className='h-8 text-xs'>
                              <SelectValue placeholder='Type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='NORMAL'>NORMAL</SelectItem>
                            <SelectItem value='VIP'>VIP</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Button
                      type='button'
                      variant='destructive'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => remove(index)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='text-muted-foreground text-[10px]'>
                    ID: #{field.id}
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className='text-muted-foreground bg-muted/20 col-span-full rounded-xl border-2 border-dashed py-12 text-center'>
                  No images in pool. Add some images to this level.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className='flex items-center justify-end gap-4 pb-8'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/dashboard/config-level')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='min-w-[120px]'
          >
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </Form>
  );
}
