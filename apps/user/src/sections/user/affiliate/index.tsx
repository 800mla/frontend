"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Icon } from "@workspace/ui/composed/icon";
import {
  queryUserAffiliate,
  queryUserAffiliateList,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import type { ReactNode } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";

export default function Affiliate() {
  const { t } = useTranslation("affiliate");
  const { user, common } = useGlobalStore();

  const { data: summary } = useQuery({
    queryKey: ["queryUserAffiliate"],
    queryFn: async () => {
      const response = await queryUserAffiliate();
      return response.data.data;
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ["queryUserAffiliateList", 1, 12],
    queryFn: async () => {
      const response = await queryUserAffiliateList({
        page: 1,
        size: 12,
      });
      return response.data.data?.list || [];
    },
  });

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?invite=${user?.refer_code || ""}`
      : "";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,245,241,0.95))] shadow-[0_24px_64px_-52px_rgba(63,47,33,0.18)] dark:bg-[linear-gradient(135deg,rgba(24,24,23,0.98),rgba(18,18,17,0.96))]">
        <CardHeader className="space-y-3 p-6 md:p-7">
          <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.18em]">
            Invite Center
          </div>
          <CardTitle className="text-[1.55rem] tracking-tight">
            我的邀请
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-7">
            这里集中展示返佣摘要、分享入口和邀请记录。拿起链接就能分享，回来看也能马上知道效果。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 border-border/50 border-t bg-background/35 p-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile
            icon="uil:wallet"
            label={t("totalCommission", "Total Commission")}
            value={
              <Display type="currency" value={summary?.total_commission || 0} />
            }
          />
          <SummaryTile
            icon="uil:percentage"
            label={t("commissionRate", "Commission Rate")}
            value={`${
              user?.referral_percentage ||
              common?.invite?.referral_percentage ||
              0
            }%`}
          />
          <SummaryTile
            icon="uil:users-alt"
            label={t("inviteRecords", "Invite Records")}
            value={`${summary?.registers || 0} 人`}
          />
          <SummaryTile
            icon="uil:tag-alt"
            label={t("inviteCode", "Invite Code")}
            value={user?.refer_code || "--"}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
        <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,243,0.93))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:bg-[linear-gradient(180deg,rgba(23,24,23,0.98),rgba(18,18,17,0.96))]">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
              <Icon className="size-4" icon="uil:share-alt" />
              分享入口
            </div>
            <CardTitle className="text-xl tracking-tight">
              邀请链接与邀请码
            </CardTitle>
            <CardDescription className="text-sm leading-7">
              推荐直接复制邀请链接。用户从你的入口注册并下单后，返佣会自动累计到当前账户。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[24px] border border-border/55 bg-background/75 p-5">
                <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                  {t("inviteCode", "Invite Code")}
                </div>
                <div className="mt-3 font-semibold text-[1.8rem] text-foreground tracking-tight">
                  {user?.refer_code || "--"}
                </div>
                <div className="mt-2 text-muted-foreground text-sm leading-7">
                  推荐把邀请码和链接一起保存，方便不同场景下快速分享。
                </div>
              </div>

              <div className="rounded-[24px] border border-border/55 bg-background/75 p-5">
                <div className="text-muted-foreground text-xs uppercase tracking-[0.16em]">
                  {t("copyInviteLink", "Copy Invite Link")}
                </div>
                <div className="mt-3 break-all rounded-2xl border border-border/50 bg-background/80 px-4 py-4 font-mono text-foreground text-sm leading-7">
                  {inviteLink}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <CopyToClipboard
                    onCopy={(_, result) => {
                      if (result) {
                        toast.success(t("copySuccess", "Copy Success"));
                      }
                    }}
                    text={inviteLink}
                  >
                    <Button className="gap-2">
                      <Icon className="size-4" icon="uil:copy" />
                      {t("copyInviteLink", "Copy Invite Link")}
                    </Button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <MiniCard
                label="累计返佣"
                value={
                  <Display
                    type="currency"
                    value={summary?.total_commission || 0}
                  />
                }
              />
              <MiniCard
                label="邀请注册"
                value={`${summary?.registers || 0} 人`}
              />
              <MiniCard
                label="返佣比例"
                value={`${
                  user?.referral_percentage ||
                  common?.invite?.referral_percentage ||
                  0
                }%`}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(247,252,251,0.98),rgba(248,245,241,0.94))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:bg-[linear-gradient(180deg,rgba(22,25,24,0.96),rgba(20,19,18,0.94))]">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-background/75 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
              <Icon className="size-4" icon="uil:chart-growth" />
              邀请建议
            </div>
            <CardTitle className="text-xl tracking-tight">
              更适合当前站点的分享方式
            </CardTitle>
            <CardDescription className="text-sm leading-7">
              保持入口短、路径稳、动作单一，通常比复杂话术更容易转化。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AdviceRow
              description="链接直接把用户带到注册入口，转化链路最短。"
              title="优先发链接"
            />
            <AdviceRow
              description="聊天或截图场景下，邀请码更容易手动输入。"
              title="同时保留邀请码"
            />
            <AdviceRow
              description="对你的站点来说，稳定感比夸张营销更有说服力。"
              title="先讲稳定，再讲优惠"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,243,0.93))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:bg-[linear-gradient(180deg,rgba(23,24,23,0.98),rgba(18,18,17,0.96))]">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
            <Icon className="size-4" icon="uil:list-ul" />
            邀请记录
          </div>
          <CardTitle className="text-xl tracking-tight">最近邀请记录</CardTitle>
          <CardDescription className="text-sm leading-7">
            先展示最近 12 条注册记录，方便你快速确认分享效果。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="overflow-hidden rounded-[24px] border border-border/55">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>用户标识</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((item) => (
                    <TableRow key={`${item.identifier}-${item.registered_at}`}>
                      <TableCell className="font-medium">
                        {item.identifier}
                      </TableCell>
                      <TableCell>{formatDate(item.registered_at)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-600 text-xs dark:text-emerald-400">
                          {item.enable ? "已生效" : "待激活"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-[24px] border border-border/55 border-dashed bg-background/70 px-5 py-8 text-center text-muted-foreground text-sm leading-7">
              暂时还没有邀请记录，先把链接分享出去，新的注册会显示在这里。
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-border/50 bg-background/80 p-4 shadow-[0_18px_44px_-40px_rgba(42,32,24,0.14)]">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-[0.14em]">
        <Icon className="size-4 text-primary" icon={icon} />
        {label}
      </div>
      <div className="mt-2.5 font-medium text-base text-foreground">
        {value}
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-border/50 bg-background/80 px-4 py-3">
      <div className="text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
        {label}
      </div>
      <div className="mt-1.5 font-medium text-foreground text-sm">{value}</div>
    </div>
  );
}

function AdviceRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/50 bg-background/78 p-4">
      <div className="font-medium text-foreground">{title}</div>
      <div className="mt-1.5 text-muted-foreground text-sm leading-7">
        {description}
      </div>
    </div>
  );
}
