'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageType } from '@/types/image.type';
import { CheckCircle2, XCircle, Clock, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { MonacoReadonlyEditor } from '@/components/ui/monaco-readonly-editor';

interface ImageDetailViewProps {
  image: ImageType;
}

const getStatusBadge = (status: string, type: 'status' | 'sync' = 'status') => {
  if (type === 'sync') {
    const Icon =
      status === 'COMPLETED'
        ? CheckCircle2
        : status === 'FAILED'
          ? XCircle
          : Clock;
    return (
      <Badge
        variant={
          status === 'COMPLETED'
            ? 'default'
            : status === 'FAILED'
              ? 'destructive'
              : 'secondary'
        }
        className={cn(
          status === 'COMPLETED'
            ? 'bg-green-500 text-white'
            : status === 'FAILED'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
        )}
      >
        <Icon className='mr-1 h-3 w-3' />
        {status}
      </Badge>
    );
  }

  const Icon = status === 'ACTIVE' ? CheckCircle2 : XCircle;
  return (
    <Badge
      variant={status === 'ACTIVE' ? 'default' : 'destructive'}
      className={cn(
        status === 'ACTIVE'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      )}
    >
      <Icon className='mr-1 h-3 w-3' />
      {status}
    </Badge>
  );
};

export function ImageDetailView({ image }: ImageDetailViewProps) {
  const router = useRouter();

  return (
    <div className='w-full space-y-4'>
      <div className='flex justify-end'>
        <Button
          onClick={() => router.push(`/dashboard/image/edit/${image.id}`)}
        >
          <Edit className='mr-2 h-4 w-4' />
          Edit Image
        </Button>
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Ảnh thumbnail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative h-64 w-full'>
              <Image
                fill
                className='rounded-lg object-contain'
                alt='Thumbnail'
                src={image.thumbnailUrl || '/images/empty-image.jpg'}
                unoptimized
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ảnh Full</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative h-64 w-full'>
              <Image
                fill
                className='rounded-lg object-contain'
                alt='Full Image'
                src={image.imageUrl || '/images/empty-image.jpg'}
                unoptimized
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ảnh download</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative h-64 w-full'>
              <Image
                fill
                className='rounded-lg object-contain'
                alt='Download Image'
                src={image.downloadImageUrl || '/images/empty-image.jpg'}
                unoptimized
              />
            </div>
          </CardContent>
        </Card>

        {image.videoUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='relative h-64 w-full'>
                <video
                  controls
                  className='h-full w-full rounded-lg object-contain'
                  src={image.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Thông tin chi tiết về hình ảnh</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-muted-foreground text-sm'>Is_Vip</p>
                <p className='font-medium'>{image.isVip ? 'Có' : 'Không'}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Level_sexy</p>
                <p className='font-medium'>{image.levelSexy}</p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Lượt chơi</p>
                <p className='font-medium'>
                  {image.playCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Lượt thích</p>
                <p className='font-medium'>
                  {image.likeCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Lượt tải</p>
                <p className='font-medium'>
                  {image.downloadCount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className='text-muted-foreground text-sm'>Trạng thái</p>
                {getStatusBadge(image.status, 'status')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái xử lý</CardTitle>
            <CardDescription>Các trạng thái sync và xử lý</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Trạng thái gen metadata
                </p>
                {getStatusBadge(image.metadataGenStatus || '', 'sync')}
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Trạng thái Embedding
                </p>
                {getStatusBadge(image.embeddingStatus || '', 'sync')}
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Trạng thái sync khoanh vùng ảnh
                </p>
                {getStatusBadge(image.annotationSyncStatus || '', 'sync')}
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Trạng thái sync Elasticsearch
                </p>
                {getStatusBadge(image.elasticsearchSyncStatus || '', 'sync')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>Image metadata information</CardDescription>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>
                Metadata Sync Status
              </p>
              {getStatusBadge(image.metadataGenStatus || '', 'sync')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MonacoReadonlyEditor
            value={JSON.stringify(image.metadata || {}, null, 2) || ''}
            language='json'
            height='500px'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Embedding</CardTitle>
              <CardDescription>Image embedding information</CardDescription>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Embedding Status</p>
              {getStatusBadge(image.embeddingStatus || '', 'sync')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MonacoReadonlyEditor
            value={JSON.stringify(image.embedding || {}, null, 2)}
            language='json'
            height='500px'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Annotations</CardTitle>
          <CardDescription>Image annotation regions</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <p className='text-muted-foreground text-sm'>Annotation Count</p>
              <p className='font-medium'>{image.annotations?.length || 0}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>
                Annotation Sync Status
              </p>
              {getStatusBadge(image.annotationSyncStatus || '', 'sync')}
            </div>
            {image.annotations && image.annotations.length > 0 && (
              <div className='md:col-span-2'>
                <p className='text-muted-foreground mb-2 text-sm'>
                  Annotation Details
                </p>
                <div className='space-y-2'>
                  {image.annotations.slice(0, 5).map((ann, index) => (
                    <div
                      key={ann.id || index}
                      className='bg-muted/30 rounded-lg border p-3'
                    >
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm font-semibold'>
                          Region {index + 1}
                        </span>
                        {ann.label && (
                          <Badge variant='outline'>{ann.label}</Badge>
                        )}
                      </div>
                      <div className='grid grid-cols-4 gap-2 text-xs'>
                        <div>
                          <span className='text-muted-foreground'>x: </span>
                          <span className='font-mono'>
                            {ann.bbox_norm.x.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>y: </span>
                          <span className='font-mono'>
                            {ann.bbox_norm.y.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>w: </span>
                          <span className='font-mono'>
                            {ann.bbox_norm.w.toFixed(4)}
                          </span>
                        </div>
                        <div>
                          <span className='text-muted-foreground'>h: </span>
                          <span className='font-mono'>
                            {ann.bbox_norm.h.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {image.annotations.length > 5 && (
                    <p className='text-muted-foreground pt-2 text-center text-sm'>
                      ... and {image.annotations.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className='mb-4'>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Created At</p>
              <p className='font-medium'>
                {format(new Date(image.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Updated At</p>
              <p className='font-medium'>
                {format(new Date(image.updatedAt), 'dd/MM/yyyy HH:mm:ss')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
