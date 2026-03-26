import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

export const authInputClassName =
  "h-12 rounded-[18px] border-border/55 bg-background/88 px-4 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-all placeholder:text-muted-foreground/65 focus-visible:border-primary/38 focus-visible:ring-primary/15 dark:bg-card/78";

export const authSubmitButtonClassName =
  "h-12 rounded-[18px] bg-primary text-primary-foreground shadow-[0_14px_32px_-24px_hsl(var(--primary))] transition-all hover:bg-primary/95";

export const authLinkButtonClassName =
  "h-auto p-0 font-medium text-foreground/75 no-underline transition-colors hover:text-primary hover:no-underline";

export const authInlineToggleButtonClassName =
  "h-auto px-0 text-[13px] font-medium text-primary/85 no-underline transition-colors hover:text-primary hover:no-underline";

export const authSoftPanelClassName =
  "rounded-[20px] border border-border/50 bg-muted/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-sm";

export function AuthFieldHeading({
  icon,
  title,
  action,
  className,
}: {
  icon: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-medium text-[13px] text-foreground/92 tracking-[0.02em]">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-3.5" icon={icon} />
          </span>
          <span>{title}</span>
        </div>
      </div>
      {action}
    </div>
  );
}
