'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

export function Header({ className, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'header-fixed peer/header top-0 sticky z-50 h-16 px-4 md:rounded-xl md:me-2',
        'transition-[top] duration-300 ease-in-out',
        offset > 30
          ? 'shadow-sm md:top-2 bg-clip-padding backdrop-filter backdrop-blur-xl dark:border-b dark:md:border dark:border-white-900'
          : 'shadow-none',
        className,
      )}
      {...props}
    >
      <div className="flex h-full items-center gap-2">{children}</div>
    </header>
  );
}
