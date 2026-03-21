"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Sidebar, SidebarContent } from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
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

  return (
    <Sidebar collapsible="none" side="right" {...props}>
      <SidebarContent className="gap-4 px-2">
        <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 font-medium text-sm">
              <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
                <Icon className="size-4" icon="uil:wallet" />
              </div>
              {t("accountBalance", "Account Balance")}
            </CardTitle>
            <Recharge className="p-0 font-semibold text-accent hover:text-accent/80" variant="link" />
          </CardHeader>
          <CardContent className="p-4 pt-2 font-bold text-2xl">
            <Display type="currency" value={user?.balance} />
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
          <CardHeader className="space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 font-medium text-sm">
              <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
                <Icon className="size-4" icon="uil:gift" />
              </div>
              {t("giftAmount", "Gift Amount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 font-bold text-2xl">
            <Display type="currency" value={user?.gift_amount} />
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
          <CardHeader className="space-y-0 p-4 pb-2">
            <CardTitle className="flex items-center gap-2 font-medium text-sm">
              <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
                <Icon className="size-4" icon="uil:money-withdrawal" />
              </div>
              {t("commission", "Commission")}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 font-bold text-2xl">
            <Display type="currency" value={user?.commission} />
          </CardContent>
        </Card>
        {user?.refer_code && (
          <Card className="border-border/50 bg-card/60 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
              <CardTitle className="flex items-center gap-2 font-medium text-sm">
                <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
                  <Icon className="size-4" icon="uil:users-alt" />
                </div>
                {t("inviteCode", "Invite Code")}
              </CardTitle>
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
            </CardHeader>
            <CardContent className="truncate p-4 pt-2 font-mono font-bold tracking-wider">
              {user?.refer_code}
            </CardContent>
          </Card>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
