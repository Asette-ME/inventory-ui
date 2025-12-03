import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WithGoogle({
  className,
  btnTextPrefix,
  ...props
}: React.ComponentProps<typeof Button> & {
  btnTextPrefix: string;
}) {
  return (
    <Button
      variant="outline"
      type="button"
      className={cn("", className)}
      {...props}
    >
      <GoogleIcon />
      {btnTextPrefix} with Google
    </Button>
  );
}
