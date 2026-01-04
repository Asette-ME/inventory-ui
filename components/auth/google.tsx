'use client';

import { GoogleIcon } from '@/components/icons/google';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function WithGoogle({
  className,
  btnTextPrefix,
  ...props
}: React.ComponentProps<typeof Button> & {
  btnTextPrefix: string;
}) {
  const { loginWithGoogle } = useAuth();

  return (
    <Button variant="outline" type="button" className={cn('', className)} onClick={loginWithGoogle} {...props}>
      <GoogleIcon />
      {btnTextPrefix} with Google
    </Button>
  );
}
