"use client";

import { Button } from "@workspace/ui/components/button";
import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { isBrowser } from "@workspace/ui/utils/index";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import Recharge from "@/sections/subscribe/recharge";
import { useGlobalStore } from "@/stores/global";

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { user } = useGlobalStore();
  const { t } = useTranslation("layout");
  const summaryItems = [
    {
      icon: "uil:wallet",
      title: t("accountBalance", "Account Balance"),
      value: <Display type="currency" value={user?.balance} />,
      action: (
        <Recharge
          className="h-auto p-0 text-xs font-medium text-primary hover:no-underline"
          variant="link"
        />
      ),
    },
    {
      icon: "uil:gift",
      title: t("giftAmount", "Gift Amount"),
      value: <Display type="currency" value={user?.gift_amount} />,
    },
    {
      icon: "uil:money-withdrawal",
      title: t("commission", "Commission"),
      value: <Display type="currency" value={user?.commission} />,
    },
  ];

  return (
    <Sidebar collapsible="none" side="right" {...props}>
      <SidebarContent className="gap-4 px-0">
        <div className="rounded-[24px] border border-border/45 bg-background/72 p-4 shadow-[0_18px_48px_-42px_rgba(76,54,38,0.18)] backdrop-blur-xl">
          <div className="mb-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/85">
              BINGKA SUMMARY
            </div>
            <div className="mt-2 text-sm leading-6 text-muted-foreground">
              账户状态一眼看清，不让侧栏抢走主内容注意力。
            </div>
          </div>
          <div className="space-y-1">
            {summaryItems.map((item, index) => (
              <div
                className={cn(
                  "flex items-start justify-between gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted/10",
                  index !== 0 && "border-t border-border/35"
                )}
                key={item.title}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4" icon={item.icon} />
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      {item.title}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {item.value}
                    </div>
                  </div>
                </div>
                {item.action}
              </div>
            ))}
          </div>
        </div>
        {user?.refer_code && (
          <div className="rounded-[24px] border border-border/45 bg-background/72 p-4 shadow-[0_18px_48px_-42px_rgba(76,54,38,0.18)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-4" icon="uil:users-alt" />
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {t("inviteCode", "Invite Code")}
                  </div>
                  <div className="mt-1 text-sm text-foreground/85">
                    分享给朋友时使用
                  </div>
                </div>
              </div>
              <CopyToClipboard
                onCopy={(_text: string, result: boolean) => {
                  if (result) {
                    toast.success(t("copySuccess", "Copy Success"));
                  }
                }}
                text={`${isBrowser() && location?.origin}/#/auth?invite=${user?.refer_code}`}
              >
                  <Button className="size-6 p-0 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent" variant="ghost">
                    <Icon
                      className="text-sm"
                      icon="mdi:content-copy"
                    />
                  </Button>
              </CopyToClipboard>
            </div>
            <div className="mt-4 truncate rounded-2xl border border-border/40 bg-muted/10 px-4 py-3 font-mono font-semibold tracking-wider text-foreground">
              {user?.refer_code}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
