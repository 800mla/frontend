"use client";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Icon } from "@workspace/ui/composed/icon";
import { getClient } from "@workspace/ui/services/common/common";
import {
  queryUserSubscribe,
  resetUserSubscribeToken,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { QRCodeCanvas } from "qrcode.react";
import { useMemo } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";
import ChangePassword from "./change-password";
import NotifySettings from "./notify-settings";
import ThirdPartyAccounts from "./third-party-accounts";

const platforms: (keyof API.DownloadLink)[] = [
  "windows",
  "mac",
  "linux",
  "ios",
  "android",
  "harmony",
];

export default function Profile() {
  const { user, getUserSubscribe, getAppSubLink } = useGlobalStore();

  const { data: userSubscribe = [], refetch } = useQuery({
    queryKey: ["queryUserSubscribe"],
    queryFn: async () => {
      const { data } = await queryUserSubscribe();
      return data.data?.list || [];
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["getClient"],
    queryFn: async () => {
      const { data } = await getClient({
        skipErrorHandler: true,
      });
      return data.data?.list || [];
    },
  });

  const activeSubscription =
    userSubscribe.find((item) => item.status === 1) || userSubscribe[0];

  const primarySubscriptionLink = activeSubscription
    ? getUserSubscribe(activeSubscription.short, activeSubscription.token)[0] ||
      ""
    : "";

  const importApplications = useMemo(
    () =>
      applications
        .filter((application) =>
          platforms.some(
            (platform) =>
              !!application.download_link?.[platform] && !!application.scheme
          )
        )
        .slice(0, 6),
    [applications]
  );

  const trafficUsed = activeSubscription
    ? activeSubscription.upload + activeSubscription.download
    : 0;

  const trafficPercent = activeSubscription?.traffic
    ? Math.min(100, (trafficUsed / activeSubscription.traffic) * 100)
    : 0;

  const accountIdentifier =
    user?.auth_methods?.[0]?.auth_identifier || "Bingka User";

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
        <Card className="overflow-hidden border border-[#e9ddd1] bg-[linear-gradient(135deg,#ffffff_0%,#f8f3ee_100%)] shadow-[0_24px_58px_-44px_rgba(121,93,67,0.18)] dark:border-[#2f2620] dark:bg-[linear-gradient(135deg,rgba(28,23,20,0.98),rgba(21,18,16,0.96))]">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-[#f3ede6]">
                  我的钱包
                </div>
                <div className="mt-4 font-semibold text-[#201712] text-[3rem] leading-none dark:text-[#f3ede6]">
                  <Display type="currency" value={user?.balance || 0} />
                </div>
                <div className="mt-3 max-w-[220px] text-[#8a7868] text-[1rem] leading-8 dark:text-[#aa9d92]">
                  包含可用钱包余额和邀请佣金概览。
                </div>
              </div>

              <div className="grid gap-3 text-right">
                <SummaryMini
                  label="账户余额"
                  value={<Display type="currency" value={user?.balance || 0} />}
                />
                <SummaryMini
                  label="佣金金额"
                  value={
                    <Display type="currency" value={user?.commission || 0} />
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-2xl bg-[#6f4e37] px-6 text-white hover:bg-[#5d4330]"
              >
                <Link to="/wallet">钱包中心</Link>
              </Button>
              <Button asChild className="rounded-2xl" variant="outline">
                <Link to="/affiliate">查看邀请</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-[#e9ddd1] bg-[linear-gradient(135deg,#ffffff_0%,#f5faf8_100%)] shadow-[0_24px_58px_-44px_rgba(121,93,67,0.18)] dark:border-[#2f2620] dark:bg-[linear-gradient(135deg,rgba(28,23,20,0.98),rgba(21,18,16,0.96))]">
          <CardContent className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-[#f3ede6]">
                我的订阅
              </div>
              <div className="font-semibold text-[#201712] text-[3rem] leading-none dark:text-[#f3ede6]">
                {activeSubscription
                  ? activeSubscription.subscribe.name
                  : "Free 无订阅"}
              </div>

              <div className="grid gap-1 text-[#6f635b] text-[1.05rem] leading-8 dark:text-[#b2a59a]">
                <div>
                  流量重置时间：
                  <span className="font-semibold text-[#26211d] dark:text-[#efe7dd]">
                    {activeSubscription?.reset_time
                      ? formatDate(activeSubscription.reset_time)
                      : "无需重置"}
                  </span>
                </div>
                <div>
                  到期时间：
                  <span className="font-semibold text-[#26211d] dark:text-[#efe7dd]">
                    {activeSubscription
                      ? activeSubscription.expire_time
                        ? formatDate(activeSubscription.expire_time)
                        : "永久有效"
                      : "尚未开通"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className="relative flex h-48 w-48 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2cb89f ${trafficPercent}%, #caebe4 ${trafficPercent}% 100%)`,
                }}
              >
                <div className="flex h-34 w-34 flex-col items-center justify-center rounded-full bg-white dark:bg-[#171311]">
                  <div className="text-[#7a7d82] text-sm dark:text-[#a89a8e]">
                    总流量
                  </div>
                  <div className="mt-2 font-semibold text-[#2a2a2a] text-[2rem] dark:text-[#f3ede6]">
                    {activeSubscription?.traffic ? (
                      <Display
                        type="traffic"
                        value={activeSubscription.traffic}
                      />
                    ) : (
                      "0 GB"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <ChangePassword />

        <Card className="overflow-hidden border border-[#e9ddd1] bg-white shadow-[0_24px_58px_-44px_rgba(121,93,67,0.18)] dark:border-[#2f2620] dark:bg-[#171311]">
          <CardHeader className="space-y-3">
            <CardTitle className="text-[2rem] tracking-tight">
              订阅中心
            </CardTitle>
            <CardDescription className="text-[1rem] leading-7">
              复制订阅链接、扫码导入客户端，以及进行订阅相关操作都集中在这里。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-5">
              <div>
                <div className="mb-3 font-medium text-[#8a8f98] text-[1.05rem] dark:text-[#a89a8e]">
                  订阅链接
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-[#dfe5ea] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center dark:border-[#302821] dark:bg-[#211b18]">
                  <div className="min-w-0 flex-1 break-all text-[#222] text-[0.95rem] dark:text-[#efe7de]">
                    {primarySubscriptionLink || "当前还没有可用订阅链接"}
                  </div>
                  <CopyToClipboard
                    onCopy={(_, result) => {
                      if (result) toast.success("复制成功");
                    }}
                    text={primarySubscriptionLink}
                  >
                    <Button
                      className="h-10 rounded-xl border-[#dccbbb] bg-[#f8efe6] px-4 text-[#5b4331] hover:bg-[#efe3d7] dark:border-[#3a2f28] dark:bg-[#241d19] dark:text-[#f0e4d8] dark:hover:bg-[#2b221d]"
                      disabled={!primarySubscriptionLink}
                      size="sm"
                      variant="outline"
                    >
                      <Icon className="mr-2 size-4" icon="uil:copy" />
                      复制链接
                    </Button>
                  </CopyToClipboard>
                </div>
              </div>

              <div>
                <div className="mb-3 font-medium text-[#8a8f98] text-[1.05rem] dark:text-[#a89a8e]">
                  快速导入到第三方客户端
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {importApplications.map((application) => {
                    const importLink = getAppSubLink(
                      primarySubscriptionLink,
                      application.scheme
                    );
                    return (
                      <CopyToClipboard
                        key={application.id}
                        onCopy={(_, result) => {
                          if (!result) return;
                          if (importLink && typeof window !== "undefined") {
                            window.location.href = importLink;
                          }
                          toast.success("复制成功");
                        }}
                        text={importLink}
                      >
                        <button
                          className="hover:-translate-y-0.5 flex size-11 items-center justify-center rounded-2xl border border-[#e7ecf1] bg-white shadow-sm transition-transform dark:border-[#312821] dark:bg-[#211b18]"
                          type="button"
                        >
                          {application.icon ? (
                            <img
                              alt={application.name}
                              className="size-7 object-contain"
                              height="28"
                              src={application.icon}
                              width="28"
                            />
                          ) : (
                            <Icon
                              className="size-5 text-[#5564d7]"
                              icon="uil:apps"
                            />
                          )}
                        </button>
                      </CopyToClipboard>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#efe4d8] bg-[#fcf8f3] px-4 py-3 dark:border-[#312923] dark:bg-[#211b18]">
                <div className="text-[#75685d] text-sm dark:text-[#aa9d92]">
                  当前账户
                </div>
                <div className="mt-1 font-medium text-[#2f241d] text-[1.1rem] dark:text-[#f3ede6]">
                  {accountIdentifier}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-4">
              {activeSubscription ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="self-end rounded-full bg-[#ff5f61] text-white hover:bg-[#ef4d50]">
                      重置订阅
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>提示</AlertDialogTitle>
                      <AlertDialogDescription>
                        您确定要重置订阅吗？
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          await resetUserSubscribeToken({
                            user_subscribe_id: activeSubscription.id,
                          });
                          await refetch();
                          toast.success("重置成功");
                        }}
                      >
                        确认
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  className="self-end rounded-full"
                  disabled
                  variant="outline"
                >
                  暂无订阅
                </Button>
              )}
              <div className="rounded-[24px] bg-white p-4 shadow-[0_20px_46px_-36px_rgba(58,67,89,0.24)] dark:bg-[#f8f3ed]">
                <QRCodeCanvas
                  size={156}
                  value={primarySubscriptionLink || " "}
                />
              </div>
              <div className="text-center text-[#8a8f98] text-[1rem] leading-7 dark:text-[#aa9d92]">
                扫描二维码导入订阅到
                <br />
                Shadowrocket / Clash 等客户端
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <ThirdPartyAccounts />
        <NotifySettings />
      </div>
    </div>
  );
}

function SummaryMini({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#eadfd3] bg-white/90 px-4 py-3 text-left shadow-sm dark:border-[#312923] dark:bg-[#211b18]">
      <div className="text-[#8f8175] text-xs uppercase tracking-[0.14em] dark:text-[#aa9d92]">
        {label}
      </div>
      <div className="mt-1 font-medium text-[#2f241d] text-[1.1rem] dark:text-[#f3ede6]">
        {value}
      </div>
    </div>
  );
}
