import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border-[0.5px] px-2 py-0.5 text-[11px] font-medium leading-normal w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:ring-ring/15 focus-visible:ring-2 aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/10 text-primary',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground',
        destructive:
          'border-transparent bg-destructive/10 text-destructive',
        outline: 'text-foreground border-border/60',
        success:
          'border-transparent bg-emerald-50 text-emerald-800',
        warning:
          'border-transparent bg-amber-50 text-amber-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
