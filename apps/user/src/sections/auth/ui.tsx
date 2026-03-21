import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import type { ReactNode } from "react";

export const authInputClassName =
  "h-12 rounded-[20px] border-border/60 bg-background/80 px-4 text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_-22px_rgba(0,0,0,0.5)] transition-all placeholder:text-muted-foreground/65 focus-visible:border-primary/45 focus-visible:ring-primary/20 dark:bg-card/70";

export const authSubmitButtonClassName =
  "h-12 rounded-[20px] bg-primary text-primary-foreground shadow-[0_18px_40px_-24px_hsl(var(--primary))] transition-all hover:-translate-y-0.5 hover:bg-primary/95";

export const authLinkButtonClassName =
  "h-auto p-0 font-medium text-foreground/75 no-underline transition-colors hover:text-primary hover:no-underline";

export const authInlineToggleButtonClassName =
  "h-auto px-0 text-[13px] font-medium text-primary/85 no-underline transition-colors hover:text-primary hover:no-underline";

export const authSoftPanelClassName =
  "rounded-[24px] border border-border/55 bg-muted/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm";

export function AuthFieldHeading({
  icon,
  title,
  description,
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
        <div className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.04em] text-foreground">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Icon className="size-4" icon={icon} />
          </span>
          <span>{title}</span>
        </div>
        {description && (
          <p className="mt-1 pl-9 text-[12px] leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
