import { Skeleton } from '@/components/ui/skeleton';

export type ChartCardSkeletonProps = {
  readonly heightClassName: string;
};

export default function ChartCardSkeleton({ heightClassName }: ChartCardSkeletonProps) {
  return <Skeleton className={heightClassName} />;
}

