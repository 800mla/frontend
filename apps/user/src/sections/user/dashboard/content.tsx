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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Progress } from "@workspace/ui/components/progress";
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { getClient, getStat } from "@workspace/ui/services/common/common";
import { queryAnnouncement } from "@workspace/ui/services/user/announcement";
import {
  queryUserAffiliate,
  queryUserSubscribe,
  resetUserSubscribeToken,
} from "@workspace/ui/services/user/user";
import { differenceInDays, formatDate } from "@workspace/ui/utils/formatting";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { useGlobalStore } from "@/stores/global";
import { getPlatform } from "@/utils/common";
import Renewal from "../../subscribe/renewal";
import ResetTraffic from "../../subscribe/reset-traffic";
import Unsubscribe from "../../subscribe/unsubscribe";

const platforms: (keyof API.DownloadLink)[] = [
  "windows",
  "mac",
  "linux",
  "ios",
  "android",
  "harmony",
];

const promoDurationMs = 1000 * 60 * 60 * 24;

type PromoState = "pending" | "dismissed" | "claimed";

export default function Content() {
  const { t } = useTranslation("dashboard");
  const { user, common, getUserSubscribe, getAppSubLink } = useGlobalStore();

  const [protocol, setProtocol] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoState, setPromoState] = useState<PromoState>("pending");
  const [promoEndsAt, setPromoEndsAt] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [platform, setPlatform] = useState<keyof API.DownloadLink>(() => {
    const detectedPlatform =
      getPlatform() === "macos"
        ? "mac"
        : (getPlatform() as keyof API.DownloadLink);
    return detectedPlatform;
  });

  const {
    data: userSubscribe = [],
    refetch,
    isLoading,
  } = useQuery({
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

  const { data: stat } = useQuery({
    queryKey: ["getStat"],
    queryFn: async () => {
      const { data } = await getStat({
        skipErrorHandler: true,
      });
      return data.data;
    },
    refetchOnWindowFocus: false,
  });

  const { data: affiliateSummary } = useQuery({
    queryKey: ["queryUserAffiliate"],
    queryFn: async () => {
      const response = await queryUserAffiliate();
      return response.data.data;
    },
  });

  const { data: pinnedAnnouncement } = useQuery({
    queryKey: ["dashboard-pinned-announcement"],
    queryFn: async () => {
      const result = await queryAnnouncement(
        {
          page: 1,
          size: 10,
          pinned: true,
          popup: false,
        },
        {
          skipErrorHandler: true,
        }
      );
      return result.data.data?.announcements[0] || null;
    },
    enabled: !!user,
  });

  const availablePlatforms = React.useMemo(() => {
    if (!applications.length) return platforms;

    const platformsSet = new Set<keyof API.DownloadLink>();
    applications.forEach((app) => {
      if (!app.download_link) return;
      platforms.forEach((item) => {
        if (app.download_link?.[item]) {
          platformsSet.add(item);
        }
      });
    });

    return platforms.filter((item) => platformsSet.has(item));
  }, [applications]);

  useEffect(() => {
    if (
      availablePlatforms.length > 0 &&
      !availablePlatforms.includes(platform)
    ) {
      const firstAvailablePlatform = availablePlatforms[0];
      if (firstAvailablePlatform) {
        setPlatform(firstAvailablePlatform);
      }
    }
  }, [availablePlatforms, platform]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id || typeof window === "undefined") return;

    const deadlineKey = `bingka-dashboard-promo-deadline-${user.id}`;
    const stateKey = `bingka-dashboard-promo-state-${user.id}`;

    let deadline = Number(window.localStorage.getItem(deadlineKey) || 0);
    if (!deadline || Number.isNaN(deadline) || deadline <= Date.now()) {
      deadline = Date.now() + promoDurationMs;
      window.localStorage.setItem(deadlineKey, String(deadline));
      window.localStorage.setItem(stateKey, "pending");
    }

    const storedState = window.localStorage.getItem(stateKey) as PromoState;
    const nextState: PromoState =
      storedState === "claimed" || storedState === "dismissed"
        ? storedState
        : "pending";

    setPromoEndsAt(deadline);
    setPromoState(nextState);
    setPromoOpen(nextState === "pending" && deadline > Date.now());
  }, [user?.id]);

  const activeSubscription =
    userSubscribe.find((item) => item.status === 1) || userSubscribe[0];

  const trafficUsed = activeSubscription
    ? activeSubscription.upload + activeSubscription.download
    : 0;
  const remainingTraffic = activeSubscription?.traffic
    ? Math.max(activeSubscription.traffic - trafficUsed, 0)
    : 0;
  const trafficProgress = activeSubscription?.traffic
    ? Math.min(100, (trafficUsed / activeSubscription.traffic) * 100)
    : 0;
  const subscriptionLinks = activeSubscription
    ? getUserSubscribe(
        activeSubscription.short,
        activeSubscription.token,
        protocol
      )
    : [];
  const primarySubscriptionLink = subscriptionLinks[0] || "";
  const accountIdentifier =
    user?.auth_methods?.[0]?.auth_identifier ||
    t("unknownAccount", "未命名账户");
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth?invite=${user?.refer_code || ""}`
      : "";
  const countdown = getCountdownParts(Math.max(promoEndsAt - now, 0));
  const showPinnedOffer = promoState === "dismissed" && promoEndsAt > now;
  const promoDiscountText = activeSubscription
    ? t("promoDiscountActive", "首单立减 15%")
    : t("promoDiscountNew", "新用户限时礼遇");
  const guideCards = applications
    .map((app) => {
      const downloadUrl =
        app.download_link?.[platform] ||
        getFirstDownloadLink(app.download_link);
      return {
        ...app,
        downloadUrl,
      };
    })
    .filter((app) => app.downloadUrl)
    .slice(0, 3);

  const promoStateKey = user?.id
    ? `bingka-dashboard-promo-state-${user.id}`
    : "";

  const setStoredPromoState = (nextState: PromoState) => {
    if (!promoStateKey || typeof window === "undefined") return;
    window.localStorage.setItem(promoStateKey, nextState);
    setPromoState(nextState);
  };

  const handlePromoDismiss = () => {
    setPromoOpen(false);
    setStoredPromoState("dismissed");
  };

  const handlePromoClaim = () => {
    setPromoOpen(false);
    setStoredPromoState("claimed");
  };

  const handlePromoOpenChange = (open: boolean) => {
    if (!open && promoState === "pending") {
      handlePromoDismiss();
      return;
    }
    setPromoOpen(open);
  };

  return (
    <div className="space-y-8">
      <Dialog onOpenChange={handlePromoOpenChange} open={promoOpen}>
        <DialogContent className="max-w-[560px] overflow-hidden border-border/50 bg-[linear-gradient(160deg,rgba(34,24,18,0.98),rgba(20,14,11,0.96))] p-0 text-white shadow-[0_36px_120px_-56px_rgba(0,0,0,0.72)]">
          <div className="relative overflow-hidden px-7 py-8 sm:px-9">
            <div className="-left-10 absolute top-8 h-40 w-40 rounded-full bg-[#ffb36b]/20 blur-3xl" />
            <div className="-right-12 absolute bottom-0 h-48 w-48 rounded-full bg-[#ff6a88]/25 blur-3xl" />
            <div className="relative space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-white/75 text-xs uppercase tracking-[0.18em]">
                <Icon className="size-4 text-[#ffcb8f]" icon="uil:bolt-alt" />
                {t("promoBadge", "限时秒杀")}
              </div>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="font-semibold text-3xl text-white tracking-tight">
                  {t("promoTitle", "登录专享限时礼券")}
                </DialogTitle>
                <DialogDescription className="max-w-md text-base text-white/72 leading-7">
                  {t(
                    "promoDescription",
                    "今天先把福利给到位。现在下单更划算，过时就恢复常规价格。"
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
                <div className="text-sm text-white/68">
                  {t("promoCountdown", "剩余领取时间")}
                </div>
                <div className="mt-3 flex items-baseline gap-3 font-semibold text-white">
                  <span className="text-5xl">{countdown.hours}</span>
                  <span className="text-lg text-white/55">:</span>
                  <span className="text-5xl">{countdown.minutes}</span>
                  <span className="text-lg text-white/55">:</span>
                  <span className="text-5xl">{countdown.seconds}</span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                  <div>
                    <div className="text-white/48 text-xs uppercase tracking-[0.18em]">
                      {t("promoRewardLabel", "当前权益")}
                    </div>
                    <div className="mt-1 font-semibold text-2xl text-[#ffd5a8]">
                      {promoDiscountText}
                    </div>
                  </div>
                  <Icon className="size-8 text-[#ffd5a8]" icon="uil:ticket" />
                </div>
              </div>
              <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  className="border-white/15 bg-white/6 text-white hover:bg-white/12"
                  onClick={handlePromoDismiss}
                  variant="outline"
                >
                  {t("promoDismiss", "暂不使用")}
                </Button>
                <Button
                  asChild
                  className="bg-[#ffd5a8] text-[#2c1a0f] hover:bg-[#ffe0be]"
                  size="lg"
                >
                  <Link onClick={handlePromoClaim} to="/subscribe">
                    {t("promoAction", "立即去选套餐")}
                  </Link>
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <Card className="overflow-hidden border-border/50 bg-[linear-gradient(135deg,rgba(233,246,242,0.96),rgba(236,243,249,0.92))] shadow-[0_28px_90px_-56px_rgba(62,98,86,0.42)] dark:bg-[linear-gradient(135deg,rgba(31,35,34,0.96),rgba(25,28,31,0.94))]">
          <CardContent className="relative p-6 md:p-8">
            <div className="-right-16 -top-16 absolute h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-full bg-[linear-gradient(90deg,rgba(214,167,122,0.08),transparent_55%)]" />
            <div className="relative space-y-8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="size-14 rounded-2xl border border-white/60 shadow-sm">
                    <AvatarImage alt={accountIdentifier} src={user?.avatar} />
                    <AvatarFallback className="rounded-2xl bg-primary/18 text-primary">
                      {(accountIdentifier || "B").slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/50 px-3 py-1 text-primary text-xs uppercase tracking-[0.18em] dark:bg-white/5">
                      <Icon className="size-3.5" icon="uil:shield-check" />
                      {t("overviewBadge", "我的面板")}
                    </div>
                    <div>
                      <h1 className="font-semibold text-3xl text-foreground tracking-tight">
                        {t("helloUser", "你好，{{name}}", {
                          name: accountIdentifier,
                        })}
                      </h1>
                      <p className="mt-2 max-w-xl text-muted-foreground text-sm leading-7">
                        {t(
                          "overviewSubtitle",
                          "把账户状态、订阅进度和操作入口都收在这里，登录后先看一眼就够了。"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className={isLoading ? "animate-pulse" : ""}
                    onClick={() => {
                      refetch();
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <Icon className="size-4" icon="uil:sync" />
                    {t("refresh", "刷新")}
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/profile">{t("viewProfile", "账户设置")}</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/subscribe">
                      {t("purchaseSubscription", "购买套餐")}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  icon="uil:box"
                  label={t("currentPlan", "当前套餐")}
                  value={
                    activeSubscription?.subscribe.name ||
                    t("noSubscription", "暂未开通")
                  }
                />
                <MetricCard
                  icon="uil:calendar-alt"
                  label={t("expireAt", "到期时间")}
                  value={
                    activeSubscription
                      ? activeSubscription.expire_time
                        ? formatDate(activeSubscription.expire_time)
                        : t("noLimit", "永久有效")
                      : t("purchaseSubscription", "去开通")
                  }
                />
                <MetricCard
                  icon="uil:history"
                  label={t("resetAt", "流量重置时间")}
                  value={
                    activeSubscription?.reset_time
                      ? formatDate(activeSubscription.reset_time)
                      : t("noReset", "不重置")
                  }
                />
                <MetricCard
                  icon="uil:user-circle"
                  label={t("accountIdentifier", "账户标识")}
                  value={accountIdentifier}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                <div className="rounded-[28px] border border-border/50 bg-background/75 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-muted-foreground text-sm">
                          {t("trafficOverview", "流量总览")}
                        </div>
                        <div className="mt-2 flex flex-wrap items-baseline gap-3">
                          <span className="font-semibold text-3xl text-foreground">
                            {activeSubscription?.traffic ? (
                              <Display
                                type="traffic"
                                value={remainingTraffic}
                              />
                            ) : (
                              t("noLimit", "无限制")
                            )}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {t("remainingTraffic", "剩余可用流量")}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-primary/8 px-4 py-3 text-right">
                        <div className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
                          {t("usedTraffic", "已使用流量")}
                        </div>
                        <div className="mt-1 font-semibold text-foreground text-xl">
                          <Display
                            type="traffic"
                            unlimited={!activeSubscription?.traffic}
                            value={trafficUsed}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Progress value={trafficProgress} />
                      <div className="flex items-center justify-between text-muted-foreground text-xs">
                        <span>
                          {t("trafficProgress", "使用进度")}{" "}
                          {activeSubscription?.traffic
                            ? `${trafficProgress.toFixed(1)}%`
                            : t("noLimit", "无限制")}
                        </span>
                        <span>
                          {t("expirationDays", "剩余有效天数")}{" "}
                          {activeSubscription?.expire_time
                            ? Math.max(
                                0,
                                Number(
                                  differenceInDays(
                                    new Date(activeSubscription.expire_time),
                                    new Date()
                                  )
                                )
                              )
                            : t("noLimit", "无限制")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/50 bg-background/75 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Icon
                        className="size-4 text-primary"
                        icon="uil:invoice"
                      />
                      {t("accountMeta", "基础信息")}
                    </div>
                    <div className="text-foreground text-sm leading-7">
                      <div>
                        {t("memberSince", "注册时间")}:{" "}
                        {formatDate(user?.created_at || Date.now())}
                      </div>
                      <div>
                        {t("commissionRate", "邀请返佣比例")}:{" "}
                        {user?.referral_percentage ||
                          common?.invite?.referral_percentage ||
                          0}
                        %
                      </div>
                      <div>
                        {t("balance", "账户余额")}:{" "}
                        <Display type="currency" value={user?.balance || 0} />
                      </div>
                      <div>
                        {t("giftAmount", "赠送金额")}:{" "}
                        <Display
                          type="currency"
                          value={user?.gift_amount || 0}
                        />
                      </div>
                    </div>
                    {activeSubscription && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              {t("resetSubscription", "重置订阅链接")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {t("prompt", "提示")}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {t(
                                  "confirmResetSubscription",
                                  "您确定要重置订阅吗？"
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                {t("cancel", "取消")}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await resetUserSubscribeToken({
                                    user_subscribe_id: activeSubscription.id,
                                  });
                                  await refetch();
                                  toast.success(t("resetSuccess", "重置成功"));
                                }}
                              >
                                {t("confirm", "确认")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <ResetTraffic
                          id={activeSubscription.id}
                          replacement={activeSubscription.subscribe.replacement}
                        />
                        {activeSubscription.expire_time !== 0 && (
                          <Renewal
                            id={activeSubscription.id}
                            subscribe={activeSubscription.subscribe}
                          />
                        )}
                        <Unsubscribe
                          allowDeduction={
                            activeSubscription.subscribe.allow_deduction
                          }
                          id={activeSubscription.id}
                          onSuccess={refetch}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {showPinnedOffer ? (
            <Card className="overflow-hidden border-[#f3a067]/30 bg-[linear-gradient(180deg,rgba(255,243,231,0.98),rgba(255,251,246,0.96))] shadow-[0_24px_70px_-52px_rgba(249,140,73,0.45)] dark:bg-[linear-gradient(180deg,rgba(58,39,28,0.96),rgba(33,24,18,0.96))]">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#f3a067]/30 bg-[#f7b27e]/12 px-3 py-1 text-[#d57a36] text-xs uppercase tracking-[0.18em]">
                    <Icon className="size-4" icon="uil:bell" />
                    {t("importantNotice", "重要通知")}
                  </div>
                  <Icon className="size-5 text-[#d57a36]" icon="uil:clock" />
                </div>
                <CardTitle className="font-semibold text-2xl text-foreground">
                  {t("promoNoticeTitle", "限时礼遇还在保留")}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-7">
                  {t(
                    "promoNoticeDescription",
                    "你刚才没有立即使用，我们先把入口留在右侧，但倒计时不会等人。"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <CountdownTile
                    label={t("hours", "小时")}
                    value={countdown.hours}
                  />
                  <CountdownTile
                    label={t("minutes", "分钟")}
                    value={countdown.minutes}
                  />
                  <CountdownTile
                    label={t("seconds", "秒")}
                    value={countdown.seconds}
                  />
                </div>
                <div className="rounded-2xl bg-background/70 p-4 text-foreground text-sm leading-7">
                  <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    {t("promoRewardLabel", "当前权益")}
                  </div>
                  <div className="mt-2 font-semibold text-[#d57a36] text-xl">
                    {promoDiscountText}
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link onClick={handlePromoClaim} to="/subscribe">
                    {t("promoAction", "立即去选套餐")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 bg-background/88 shadow-[0_24px_60px_-48px_rgba(0,0,0,0.2)]">
              <CardHeader>
                <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                  <Icon className="size-4 text-primary" icon="uil:megaphone" />
                  {t("quickStatus", "账户状态")}
                </div>
                <CardTitle className="text-2xl">
                  {activeSubscription
                    ? t("activeStatusTitle", "当前订阅运行正常")
                    : t("inactiveStatusTitle", "还差一步完成开通")}
                </CardTitle>
                <CardDescription className="leading-7">
                  {activeSubscription
                    ? t(
                        "activeStatusDesc",
                        "链接、流量和教程入口都已经准备好，接下来就按你的客户端环境去接入。"
                      )
                    : t(
                        "inactiveStatusDesc",
                        "现在先把套餐开通，下面的教程和邀请入口我们都已经给你排好了。"
                      )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={activeSubscription ? "/document" : "/subscribe"}>
                    {activeSubscription
                      ? t("viewGuides", "查看使用教程")
                      : t("purchaseSubscription", "购买套餐")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50 bg-background/88">
            <CardHeader>
              <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
                <Icon className="size-4 text-primary" icon="uil:bell" />
                {t("latestAnnouncement", "最新公告")}
              </div>
              <CardTitle className="text-xl">
                {pinnedAnnouncement?.title ||
                  t("noAnnouncement", "当前没有置顶通知")}
              </CardTitle>
              <CardDescription className="leading-7">
                {pinnedAnnouncement?.content
                  ? getAnnouncementExcerpt(pinnedAnnouncement.content)
                  : t(
                      "announcementFallback",
                      "没有额外公告时，这里会保持安静。"
                    )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" variant="outline">
                <Link to="/announcement">
                  {t("viewAllAnnouncements", "查看全部通知")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-2xl text-foreground tracking-tight">
              {t("guideSectionTitle", "使用教程")}
            </h2>
            <p className="mt-1 text-muted-foreground text-sm leading-7">
              {t(
                "guideSectionDesc",
                "先选客户端，再跟着教程接入。常用入口我们已经帮你排在前面。"
              )}
            </p>
          </div>
          {availablePlatforms.length > 0 && (
            <Tabs
              className="w-full max-w-full md:w-auto"
              onValueChange={(value) =>
                setPlatform(value as keyof API.DownloadLink)
              }
              value={platform}
            >
              <TabsList className="flex flex-wrap *:flex-auto">
                {availablePlatforms.map((item) => (
                  <TabsTrigger
                    className="px-2 uppercase lg:px-3"
                    key={item}
                    value={item}
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>
        {guideCards.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {guideCards.map((item, index) => (
              <Card
                className={cn(
                  "overflow-hidden border-transparent shadow-[0_24px_56px_-48px_rgba(29,41,57,0.32)]",
                  getGuideCardClassName(index)
                )}
                key={item.id}
              >
                <CardContent className="flex h-full flex-col justify-between p-6">
                  <div className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/55 px-3 py-1 text-foreground/72 text-xs backdrop-blur dark:border-white/10 dark:bg-white/6 dark:text-white/70">
                        {index === 0
                          ? t("guideTagHot", "热门")
                          : index === 1
                            ? t("guideTagRecommend", "推荐")
                            : t("guideTagQuickStart", "快速开始")}
                      </div>
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/45 shadow-sm backdrop-blur dark:bg-white/10">
                        {item.icon ? (
                          <img
                            alt={item.name}
                            className="size-8 object-contain"
                            height={32}
                            src={item.icon}
                            width={32}
                          />
                        ) : (
                          <Icon
                            className="size-7 text-foreground/70"
                            icon="uil:desktop"
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-3xl text-foreground tracking-tight">
                        {item.name}
                      </h3>
                      <p className="mt-3 text-base text-foreground/72 leading-7">
                        {item.description ||
                          t(
                            "guideCardFallback",
                            "下载客户端后，按站内教程完成接入。"
                          )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <Button asChild className="rounded-full" size="sm">
                      <a
                        href={item.downloadUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {t("downloadOrViewGuide", "下载/查看教程")}
                      </a>
                    </Button>
                    <Button asChild size="icon" variant="secondary">
                      <Link to="/document">
                        <Icon className="size-4" icon="uil:arrow-up-right" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/60 border-dashed bg-background/65">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <div className="font-medium text-foreground text-lg">
                  {t("guideEmptyTitle", "当前还没有可用教程")}
                </div>
                <div className="mt-2 text-muted-foreground text-sm">
                  {t(
                    "guideEmptyDesc",
                    "可以先去套餐页确认客户端支持情况，或者稍后再回来查看。"
                  )}
                </div>
              </div>
              <Button asChild>
                <Link to="/document">{t("viewGuides", "查看使用教程")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-2xl text-foreground tracking-tight">
            {t("subscriptionAccessTitle", "订阅链接")}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-7">
            {t(
              "subscriptionAccessDesc",
              "这里放你当前可直接使用的订阅入口，复制、扫码和快捷导入都安排好了。"
            )}
          </p>
        </div>
        {activeSubscription ? (
          <Card className="border-border/50 bg-background/92 shadow-[0_30px_90px_-70px_rgba(0,0,0,0.35)]">
            <CardContent className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-muted-foreground text-sm">
                      {t("subscriptionUrl", "订阅链接")}
                    </div>
                    <div className="font-medium text-foreground text-lg">
                      {activeSubscription.subscribe.name}
                    </div>
                  </div>
                  {stat?.protocol && stat.protocol.length > 1 && (
                    <Tabs
                      className="w-full max-w-full md:w-auto"
                      onValueChange={setProtocol}
                      value={protocol}
                    >
                      <TabsList className="flex flex-wrap *:flex-auto">
                        {["all", ...stat.protocol].map((item) => (
                          <TabsTrigger
                            className="px-2 uppercase lg:px-3"
                            key={item}
                            value={item === "all" ? "" : item}
                          >
                            {item}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  )}
                </div>
                <div className="rounded-[24px] border border-border/55 bg-muted/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1 break-all font-mono text-foreground text-sm leading-7">
                      {primarySubscriptionLink}
                    </div>
                    <CopyToClipboard
                      onCopy={(_, result) => {
                        if (result) {
                          toast.success(t("copySuccess", "复制成功"));
                        }
                      }}
                      text={primarySubscriptionLink}
                    >
                      <Button size="icon" variant="secondary">
                        <Icon className="size-4" icon="uil:copy" />
                      </Button>
                    </CopyToClipboard>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-muted-foreground text-sm">
                    {t("quickImport", "快速导入到客户端")}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {applications
                      .filter(
                        (application) =>
                          !!(
                            application.download_link?.[platform] &&
                            application.scheme
                          )
                      )
                      .slice(0, 5)
                      .map((application) => (
                        <div
                          className="flex items-center gap-3 rounded-2xl border border-border/45 bg-background px-3 py-2"
                          key={application.name}
                        >
                          {application.icon ? (
                            <img
                              alt={application.name}
                              className="size-8 object-contain"
                              height={32}
                              src={application.icon}
                              width={32}
                            />
                          ) : (
                            <Icon
                              className="size-5 text-primary"
                              icon="uil:apps"
                            />
                          )}
                          <div className="text-sm">
                            <div className="font-medium text-foreground">
                              {application.name}
                            </div>
                            <div className="text-muted-foreground">
                              {t("oneClickImport", "一键导入")}
                            </div>
                          </div>
                          <CopyToClipboard
                            onCopy={(_, result) => {
                              if (!result) return;
                              const href = getAppSubLink(
                                primarySubscriptionLink,
                                application.scheme
                              );
                              if (href && typeof window !== "undefined") {
                                window.location.href = href;
                              }
                              toast.success(t("copySuccess", "复制成功"));
                            }}
                            text={getAppSubLink(
                              primarySubscriptionLink,
                              application.scheme
                            )}
                          >
                            <Button size="sm">{t("import", "导入")}</Button>
                          </CopyToClipboard>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between rounded-[28px] border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,245,240,0.86))] p-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-[linear-gradient(180deg,rgba(31,31,31,0.96),rgba(24,24,24,0.92))]">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1 text-primary text-xs uppercase tracking-[0.18em]">
                    <Icon className="size-4" icon="uil:qrcode-scan" />
                    {t("qrCode", "二维码")}
                  </div>
                  <div className="font-medium text-foreground text-lg">
                    {t("scanToSubscribe", "扫码快速导入")}
                  </div>
                </div>
                <div className="rounded-[28px] bg-white p-4 shadow-sm dark:bg-white">
                  <QRCodeCanvas size={180} value={primarySubscriptionLink} />
                </div>
                <div className="text-muted-foreground text-sm leading-7">
                  {t(
                    "scanHint",
                    "用 Shadowrocket / Clash / Stash 等客户端扫描即可快速导入。"
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 border-dashed bg-background/70">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-foreground text-lg">
                  {t("subscriptionEmptyTitle", "还没有可用订阅链接")}
                </div>
                <div className="mt-2 text-muted-foreground text-sm">
                  {t(
                    "subscriptionEmptyDesc",
                    "先完成套餐购买，系统会自动生成你的专属订阅链接和二维码。"
                  )}
                </div>
              </div>
              <Button asChild>
                <Link to="/subscribe">
                  {t("purchaseSubscription", "购买套餐")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-2xl text-foreground tracking-tight">
            {t("inviteSectionTitle", "邀请拉新")}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm leading-7">
            {t(
              "inviteSectionDesc",
              "把邀请码和邀请链接直接放在这里，既方便你分享，也方便你随时查看返佣。"
            )}
          </p>
        </div>
        <Card className="overflow-hidden border-[#f0c37f]/25 bg-[linear-gradient(135deg,rgba(255,238,213,0.92),rgba(255,192,88,0.94))] shadow-[0_28px_90px_-64px_rgba(255,164,55,0.55)] dark:bg-[linear-gradient(135deg,rgba(73,46,21,0.95),rgba(54,35,18,0.96))]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/45 px-3 py-1 text-[#6a3d14] text-xs uppercase tracking-[0.18em] dark:border-white/10 dark:bg-white/6 dark:text-[#ffcb8f]">
                  <Icon className="size-4" icon="uil:users-alt" />
                  {t("inviteBadge", "邀请返佣")}
                </div>
                <div className="font-semibold text-3xl text-foreground tracking-tight">
                  {t("inviteMainTitle", "邀请好友，一起把返佣拿满")}
                </div>
                <p className="max-w-2xl text-foreground/72 text-sm leading-7">
                  {t(
                    "inviteMainDesc",
                    "把你的专属入口分享出去，成功注册并购买后，会按照返佣比例回到你的账户。"
                  )}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  icon="uil:tag-alt"
                  label={t("inviteCode", "邀请码")}
                  value={user?.refer_code || "--"}
                />
                <MetricCard
                  icon="uil:percentage"
                  label={t("commissionRate", "返佣比例")}
                  value={`${
                    user?.referral_percentage ||
                    common?.invite?.referral_percentage ||
                    0
                  }%`}
                />
                <MetricCard
                  icon="uil:wallet"
                  label={t("totalCommission", "累计返佣")}
                  value={
                    <Display
                      type="currency"
                      value={affiliateSummary?.total_commission || 0}
                    />
                  }
                />
              </div>

              <div className="rounded-[24px] border border-white/35 bg-white/48 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="text-foreground/75 text-sm">
                  {t("inviteLink", "邀请链接")}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1 break-all font-mono text-foreground text-sm leading-7">
                    {inviteLink}
                  </div>
                  <CopyToClipboard
                    onCopy={(_, result) => {
                      if (result) {
                        toast.success(t("copySuccess", "复制成功"));
                      }
                    }}
                    text={inviteLink}
                  >
                    <Button size="icon" variant="secondary">
                      <Icon className="size-4" icon="uil:copy" />
                    </Button>
                  </CopyToClipboard>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-[28px] border border-white/35 bg-white/45 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="space-y-3">
                <div className="text-foreground/62 text-sm uppercase tracking-[0.18em]">
                  {t("inviteQuickAction", "快速操作")}
                </div>
                <div className="font-semibold text-2xl text-foreground">
                  {t("inviteActionTitle", "把拉新入口放到手边")}
                </div>
                <p className="text-foreground/72 text-sm leading-7">
                  {t(
                    "inviteActionDesc",
                    "完整记录、邀请明细和提现后续都在邀请页，这里先给你最核心的入口。"
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link to="/affiliate">
                    {t("viewInvitationRecords", "查看邀请明细")}
                  </Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/subscribe">
                    {t("inviteAndPurchase", "先去购买套餐")}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-border/45 bg-background/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="size-4 text-primary" icon={icon} />
        {label}
      </div>
      <div className="mt-3 font-semibold text-foreground text-xl">{value}</div>
    </div>
  );
}

function CountdownTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-background/72 px-3 py-4">
      <div className="font-semibold text-3xl text-foreground">{value}</div>
      <div className="mt-1 text-muted-foreground text-xs uppercase tracking-[0.18em]">
        {label}
      </div>
    </div>
  );
}

function getFirstDownloadLink(downloadLink?: API.DownloadLink) {
  if (!downloadLink) return "";
  for (const item of platforms) {
    const url = downloadLink[item];
    if (url) return url;
  }
  return "";
}

function getCountdownParts(duration: number) {
  const totalSeconds = Math.floor(duration / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return {
    hours,
    minutes,
    seconds,
  };
}

function getAnnouncementExcerpt(content: string) {
  const plainText = content
    .replace(/[#>*_`~-]/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= 84) return plainText;
  return `${plainText.slice(0, 84)}...`;
}

function getGuideCardClassName(index: number) {
  if (index === 0) {
    return "bg-[linear-gradient(180deg,rgba(214,206,255,0.96),rgba(244,241,255,0.9))] dark:bg-[linear-gradient(180deg,rgba(60,52,96,0.96),rgba(34,30,52,0.94))]";
  }
  if (index === 1) {
    return "bg-[linear-gradient(180deg,rgba(196,226,255,0.96),rgba(241,249,255,0.9))] dark:bg-[linear-gradient(180deg,rgba(35,69,102,0.96),rgba(24,37,52,0.94))]";
  }
  return "bg-[linear-gradient(180deg,rgba(205,244,220,0.96),rgba(241,252,246,0.9))] dark:bg-[linear-gradient(180deg,rgba(43,90,68,0.96),rgba(24,43,34,0.94))]";
}
