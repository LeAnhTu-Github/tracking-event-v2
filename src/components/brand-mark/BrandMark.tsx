import * as React from 'react';

export type BrandMarkProps = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  withText?: boolean;
};

export default function BrandMark({
  className,
  logoClassName,
  textClassName,
  withText = true
}: BrandMarkProps) {
  return (
    <div className={className ?? 'flex items-center gap-2'}>
      <svg
        aria-hidden='true'
        viewBox='0 0 24 24'
        fill='none'
        className={logoClassName ?? 'h-5 w-5 text-primary'}
      >
        <path
          d='M2 12h4l2.1-6.3c.2-.7 1.2-.7 1.4 0L13 19l2.1-6.3c.2-.7 1.2-.7 1.4 0L18 12h4'
          stroke='currentColor'
          strokeWidth='2.5'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
      {withText ? (
        <span className={textClassName ?? 'text-primary text-lg font-semibold'}>
          GameStats
        </span>
      ) : null}
    </div>
  );
}

