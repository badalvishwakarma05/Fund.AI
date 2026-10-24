import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'secondary' | 'outline' | 'met' | 'notmet' | 'unknown' | 'accent';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants: Record<string, string> = {
    default:   'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    outline:   'bg-transparent text-foreground border-border',
    met:       'bg-met-50 text-met-600 border-met-200 dark:bg-met-500/10 dark:text-met-400 dark:border-met-500/20',
    notmet:    'bg-notmet-50 text-notmet-600 border-notmet-200 dark:bg-notmet-500/10 dark:text-notmet-400 dark:border-notmet-500/20',
    unknown:   'bg-unknown-50 text-unknown-600 border-unknown-200 dark:bg-unknown-500/10 dark:text-unknown-400 dark:border-unknown-500/20',
    accent:    'bg-accent-50 text-accent-700 border-accent-200 dark:bg-accent-500/10 dark:text-accent-400 dark:border-accent-500/20',
  };

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
