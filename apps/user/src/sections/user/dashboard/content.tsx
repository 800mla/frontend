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
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { getClient } from "@workspace/ui/services/common/common";
import { queryAnnouncement } from "@workspace/ui/services/user/announcement";
import { querySubscribeList } from "@workspace/ui/services/user/subscribe";
import {
  queryUserAffiliate,
  queryUserSubscribe,
  resetUserSubscribeToken,
} from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import {
  LOGIN_PROMO_COUPON_CODE,
  storeLoginPromoCoupon,
} from "@/lib/login-promo";
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

const fallbackGuideCards: Pick<
  API.SubscribeClient,
  "id" | "name" | "description" | "icon"
>[] = [
  {
    id: 1,
    name: "IOS | Shadowrocket",
    description: "视频教程，保姆教学",
    icon: "",
  },
  {
    id: 2,
    name: "Windows | Clash",
    description: "图文教程，轻松掌握",
    icon: "",
  },
  {
    id: 3,
    name: "安卓 | Clash",
    description: "图文教程，轻松掌握",
    icon: "",
  },
];

const promoDurationMs = 1000 * 60 * 60 * 24;

type PromoState = "pending" | "dismissed" | "claimed";
type GuideDevice = "ios" | "windows" | "android";

export default function Content() {
  const { t, i18n } = useTranslation("dashboard");
  const { user, common, getUserSubscribe, getAppSubLink } = useGlobalStore();

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

  const { data: subscribePlans = [] } = useQuery({
    queryKey: ["querySubscribeList", i18n.language],
    queryFn: async () => {
      const { data } = await querySubscribeList({ language: i18n.language });
      return data.data?.list || [];
    },
  });

  const { data: affiliateSummary } = useQuery({
    queryKey: ["queryUserAffiliate"],
    queryFn: async () => {
      const response = await queryUserAffiliate();
      return response.data.data;
    },
  });

  const availablePlatforms = useMemo(() => {
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
      const nextPlatform = availablePlatforms[0];
      if (nextPlatform) setPlatform(nextPlatform);
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
  const recommendedPlan =
    subscribePlans.find((item) => item.show && item.sell) || subscribePlans[0];
  const trafficUsed = activeSubscription
    ? activeSubscription.upload + activeSubscription.download
    : 0;
  const remainingTraffic = activeSubscription?.traffic
    ? Math.max(activeSubscription.traffic - trafficUsed, 0)
    : 0;
  const primarySubscriptionLink = activeSubscription
    ? getUserSubscribe(activeSubscription.short, activeSubscription.token)[0] ||
      ""
    : "";
  const accountIdentifier =
    user?.auth_methods?.[0]?.auth_identifier ||
    t("unknownAccount", "未命名账户");
  const countdown = getCountdownParts(Math.max(promoEndsAt - now, 0));
  const promoStateKey = user?.id
    ? `bingka-dashboard-promo-state-${user.id}`
    : "";
  const showPinnedOffer = promoState !== "claimed" && promoEndsAt > now;
  const guideCards =
    applications
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
      .slice(0, 3) || [];

  const finalGuideCards =
    guideCards.length > 0
      ? guideCards
      : fallbackGuideCards.map((item, index) => ({
          ...item,
          downloadUrl: "/document",
          id: item.id || index,
        }));
  const importApplications = applications
    .filter(
      (application) =>
        !!(application.download_link?.[platform] && application.scheme)
    )
    .slice(0, 6);

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
    storeLoginPromoCoupon(user?.id, LOGIN_PROMO_COUPON_CODE);
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
    <div className="mx-auto max-w-[1320px] space-y-7">
      <Dialog onOpenChange={handlePromoOpenChange} open={promoOpen}>
        <DialogContent className="max-w-[540px] overflow-hidden border-0 bg-[linear-gradient(160deg,rgba(255,120,142,0.98),rgba(255,154,102,0.95))] p-0 text-white shadow-[0_32px_96px_-56px_rgba(249,104,130,0.68)]">
          <div className="relative overflow-hidden px-6 py-7 sm:px-8">
            <div className="-left-10 absolute top-6 h-40 w-40 rounded-full bg-white/15 blur-3xl" />
            <div className="-right-8 absolute bottom-2 h-36 w-36 rounded-full bg-[#ffd9b8]/35 blur-3xl" />
            <div className="relative space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                <Icon className="size-4" icon="uil:gift" />
                {t("promoBadge", "限时秒杀")}
              </div>
              <DialogHeader className="space-y-3 text-left">
                <DialogTitle className="font-semibold text-[1.9rem] tracking-tight">
                  {t("promoTitle", "登录专享限时礼券")}
                </DialogTitle>
                <DialogDescription className="max-w-md text-sm text-white/85 leading-7">
                  {t(
                    "promoDescription",
                    "活动窗口开启中，先把优惠直接给到你。现在领取，下单时会更轻一点。"
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="rounded-[28px] bg-white/16 p-5 backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-sm text-white/80">
                      {t("promoCountdown", "剩余领取时间")}
                    </div>
                    <div className="mt-3 flex items-baseline gap-3 font-semibold">
                      <span className="text-[2.5rem]">{countdown.hours}</span>
                      <span className="text-white/55">:</span>
                      <span className="text-[2.5rem]">{countdown.minutes}</span>
                      <span className="text-white/55">:</span>
                      <span className="text-[2.5rem]">{countdown.seconds}</span>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/20 bg-white/12 px-4 py-3">
                    <div className="text-[11px] text-white/65 uppercase tracking-[0.16em]">
                      登录礼券码
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="font-semibold text-[1.05rem] text-white tracking-[0.12em]">
                        {LOGIN_PROMO_COUPON_CODE}
                      </code>
                      <CopyToClipboard
                        onCopy={(_, copied) => {
                          if (copied) {
                            toast.success("优惠码已复制");
                          }
                        }}
                        text={LOGIN_PROMO_COUPON_CODE}
                      >
                        <button
                          className="inline-flex h-8 items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 text-white/90 transition hover:bg-white/15"
                          type="button"
                        >
                          <Icon className="size-4" icon="uil:copy" />
                        </button>
                      </CopyToClipboard>
                    </div>
                    <div className="mt-2 text-white/72 text-xs leading-6">
                      领取后会自动带入套餐页，下单时按后台同名优惠券真实试算。
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button
                  className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                  onClick={handlePromoDismiss}
                  variant="outline"
                >
                  {t("promoDismiss", "暂不使用")}
                </Button>
                <Button
                  asChild
                  className="bg-white text-[#f45f81] hover:bg-white/90"
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#f7f1e9_0%,#efdfcf_55%,#e5d1be_100%)] shadow-[0_28px_70px_-46px_rgba(97,74,52,0.3)] dark:bg-[linear-gradient(135deg,#231a15,#2a1f19_52%,#32251e_100%)]">
            <CardContent className="relative p-0">
              <div className="grid min-h-[340px] gap-6 p-7 md:grid-cols-[minmax(0,1fr)_352px]">
                <div className="flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="size-12 border-2 border-white/50 shadow-md">
                        <AvatarImage
                          alt={accountIdentifier}
                          src={user?.avatar}
                        />
                        <AvatarFallback className="bg-white/85 text-[#6d4f3a]">
                          {(accountIdentifier || "B").slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-[#7b624f]/88 text-[0.95rem] dark:text-[#cab4a2]">
                          Halo, {getDisplayName(accountIdentifier)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="font-medium text-[#8a6b53]/86 text-[0.96rem] dark:text-[#b29a86]">
                        我的订阅
                      </div>
                      <div className="font-semibold text-[#241a14] text-[2.6rem] tracking-tight dark:text-[#f3ede6]">
                        {activeSubscription
                          ? activeSubscription.subscribe.name
                          : "Free 无订阅"}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-1 font-medium text-[#6b5748]/90 text-[1.02rem]">
                    <div>
                      到期时间：
                      <span className="font-semibold text-[#2f241d] dark:text-[#efe7dd]">
                        {activeSubscription
                          ? activeSubscription.expire_time
                            ? formatDate(activeSubscription.expire_time)
                            : "永久有效"
                          : "尚未开通"}
                      </span>
                    </div>
                    <div>
                      流量重置时间：
                      <span className="font-semibold text-[#2f241d] dark:text-[#efe7dd]">
                        {activeSubscription?.reset_time
                          ? formatDate(activeSubscription.reset_time)
                          : "无需重置"}
                      </span>
                    </div>
                    <div>
                      剩余可用流量：
                      <span className="font-semibold text-[#2f241d] dark:text-[#efe7dd]">
                        {activeSubscription?.traffic ? (
                          <Display type="traffic" value={remainingTraffic} />
                        ) : (
                          "0 B"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="ml-auto w-full max-w-[352px] rounded-[26px] bg-[rgba(255,248,242,0.72)] p-4 shadow-[0_22px_50px_-30px_rgba(121,84,56,0.22)] backdrop-blur-sm dark:bg-[rgba(36,29,24,0.88)] dark:shadow-[0_24px_54px_-36px_rgba(0,0,0,0.45)]">
                    <div className="rounded-[22px] bg-[rgba(255,252,249,0.82)] p-5 dark:bg-[rgba(25,21,18,0.94)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-[#8d735e] text-sm dark:text-[#b39d8a]">
                            套餐推荐
                          </div>
                          <div className="mt-2 font-semibold text-[#7b5435] text-[1.2rem] dark:text-[#f0e4d8]">
                            {recommendedPlan?.name || "前往选择套餐"}
                          </div>
                        </div>
                        <Icon
                          className="size-7 text-[#5f4432] dark:text-[#d4bfac]"
                          icon="uil:diamond"
                        />
                      </div>

                      <div className="mt-7 flex items-center justify-between gap-4">
                        <div className="font-semibold text-[#33261f] text-[1.05rem] dark:text-[#ead8c8]">
                          {recommendedPlan ? (
                            <>
                              <Display
                                type="currency"
                                value={recommendedPlan.unit_price}
                              />
                              <span className="font-medium text-[#8b7464] text-sm dark:text-[#c5ae99]">
                                /{getUnitTimeLabel(recommendedPlan.unit_time)}
                              </span>
                            </>
                          ) : (
                            "查看全部套餐"
                          )}
                        </div>
                        <Button
                          asChild
                          className="rounded-xl bg-[#704c33] px-5 text-white shadow-[0_14px_28px_-18px_rgba(96,67,46,0.65)] hover:bg-[#62412c]"
                        >
                          <Link to="/subscribe">
                            {activeSubscription ? "立即续费" : "立即购买"}
                          </Link>
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 text-center font-semibold text-[#4f3a2e] text-[0.98rem] dark:text-[#e3d5c7]">
                      套餐流量：
                      {activeSubscription?.traffic ? (
                        <Display
                          type="traffic"
                          value={activeSubscription.traffic}
                        />
                      ) : (
                        "按套餐显示"
                      )}
                      {recommendedPlan?.speed_limit
                        ? ` / 带宽速率:${recommendedPlan.speed_limit}Mbps`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-[1.1rem] text-foreground">
                  使用教程
                </div>
                <div className="mt-1 text-muted-foreground text-sm">
                  先选客户端，再直接进入对应教程。
                </div>
              </div>
              <Button
                asChild
                className="rounded-full"
                size="sm"
                variant="outline"
              >
                <Link to="/document">更多教程</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {finalGuideCards.map((item, index) => {
                const guideDevice = getGuideDevice(index);
                const guideLinkSearch = { device: guideDevice };

                return (
                  <Card
                    className={cn(
                      "group hover:-translate-y-1.5 relative overflow-hidden border-0 shadow-[0_20px_44px_-36px_rgba(98,132,185,0.35)] transition-all duration-300 hover:shadow-[0_28px_56px_-34px_rgba(77,101,158,0.42)]",
                      guideBackgrounds[index] || guideBackgrounds[2]
                    )}
                    key={item.id}
                  >
                    <CardContent className="flex h-full min-h-[216px] flex-col justify-between p-0">
                      <Link
                        className="block p-4 pb-3"
                        search={guideLinkSearch}
                        to="/document"
                      >
                        <div className="flex items-start justify-between">
                          <div className="rounded-lg bg-white/68 px-2 py-1 font-medium text-[#ff5f3f] text-xs transition-transform duration-300 group-hover:scale-[1.04]">
                            {index === 0
                              ? "热门"
                              : index === 1
                                ? "推荐"
                                : "常用"}
                          </div>
                          <div className="group-hover:-translate-y-1 flex size-14 items-center justify-center text-[#5968d6] transition-transform duration-300 group-hover:scale-105">
                            {item.icon ? (
                              <img
                                alt={item.name}
                                className="size-12 object-contain"
                                height="48"
                                src={item.icon}
                                width="48"
                              />
                            ) : (
                              <Icon
                                className="size-10 opacity-80"
                                icon={platformIcons[index] || "uil:desktop"}
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-5 text-center">
                          <div className="font-semibold text-[#5865d7] text-[1.05rem] transition-colors duration-300 group-hover:text-[#4458c7]">
                            {getTutorialTitle(index, item.name)}
                          </div>
                          <div className="mt-2 text-[#5e6a9d] text-sm transition-colors duration-300 group-hover:text-[#4a5688]">
                            {getTutorialSubtitle(index)}
                          </div>
                        </div>
                      </Link>

                      <Link
                        className="flex items-center justify-between border-white/50 border-t bg-white/42 px-4 py-3 text-[#5d79db] transition-colors duration-300 hover:bg-white/58"
                        search={guideLinkSearch}
                        to="/document"
                      >
                        <span className="font-medium text-sm">
                          {getGuideCtaLabel(guideDevice)}
                        </span>
                        <Icon
                          className="group-hover:-translate-y-0.5 size-5 transition-transform duration-300 group-hover:translate-x-1"
                          icon="uil:arrow-up-right"
                        />
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden border border-[#eddcc9] bg-white shadow-[0_24px_58px_-44px_rgba(121,93,67,0.24)] dark:border-[#2f2620] dark:bg-[#171311]">
            <CardContent className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <div className="font-medium text-[#8a8f98] text-[1.05rem] dark:text-[#a89a8e]">
                  订阅链接
                </div>

                {activeSubscription ? (
                  <>
                    <div className="flex flex-col gap-3 rounded-2xl border border-[#dfe5ea] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center dark:border-[#302821] dark:bg-[#211b18]">
                      <div className="min-w-0 flex-1 break-all text-[#222] text-[0.95rem] dark:text-[#efe7de]">
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
                        <Button
                          className="h-10 rounded-xl border-[#dccbbb] bg-[#f8efe6] px-4 text-[#5b4331] hover:bg-[#efe3d7] dark:border-[#3a2f28] dark:bg-[#241d19] dark:text-[#f0e4d8] dark:hover:bg-[#2b221d]"
                          size="sm"
                          variant="outline"
                        >
                          <Icon className="mr-2 size-4" icon="uil:copy" />
                          复制链接
                        </Button>
                      </CopyToClipboard>
                    </div>

                    <div className="space-y-3">
                      <div className="font-medium text-[#8a8f98] text-[1rem] dark:text-[#a89a8e]">
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
                                if (
                                  importLink &&
                                  typeof window !== "undefined"
                                ) {
                                  window.location.href = importLink;
                                }
                                toast.success(t("copySuccess", "复制成功"));
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

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        className={cn(isLoading && "animate-pulse")}
                        onClick={() => {
                          refetch();
                        }}
                        size="sm"
                        variant="outline"
                      >
                        刷新状态
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
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
                  </>
                ) : (
                  <div className="rounded-2xl border border-[#dfe5ea] border-dashed bg-[#fbfcfd] px-5 py-10 text-center text-[#858c95] text-sm leading-7 dark:border-[#302821] dark:bg-[#211b18] dark:text-[#aa9d92]">
                    当前还没有可用订阅链接，先购买套餐后系统会自动生成。
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-5 rounded-[28px] bg-[#fbfbfc] px-6 py-5 dark:bg-[#201916]">
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

          <Card className="overflow-hidden border-0 bg-[linear-gradient(115deg,#f5d4b0_0%,#efb374_45%,#e68537_100%)] shadow-[0_32px_80px_-44px_rgba(198,107,35,0.48)] dark:bg-[linear-gradient(115deg,#4b2c16,#5c3113_50%,#6a3711_100%)]">
            <CardContent className="grid min-h-[250px] items-center gap-6 p-0 md:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5 px-8 py-8">
                <div className="font-semibold text-[#21160f] text-[2rem] leading-tight">
                  邀请好友
                  <br />
                  赚取丰厚佣金
                </div>

                <div className="flex max-w-[390px] overflow-hidden rounded-full bg-[rgba(35,21,14,0.86)] shadow-[0_18px_42px_-30px_rgba(55,24,8,0.5)]">
                  <div className="bg-[#ffe0b8] px-8 py-5 font-semibold text-[2.4rem] text-black leading-none">
                    {user?.referral_percentage ||
                      common?.invite?.referral_percentage ||
                      0}
                    <span className="ml-1 text-[1.4rem]">%</span>
                  </div>
                  <div className="flex items-center px-8 font-medium text-[1.15rem] text-white">
                    佣金比例
                  </div>
                </div>

                <div className="max-w-[520px] font-medium text-[#2d1c11] text-[1.1rem] leading-8 dark:text-[#ffe7d0]">
                  立刻赚钱丰厚佣金返现，可提现或用于消费。累计返佣
                  <span className="mx-2 font-semibold">
                    <Display
                      type="currency"
                      value={affiliateSummary?.total_commission || 0}
                    />
                  </span>
                  ，现在就可以开始分享。
                </div>

                <Button
                  asChild
                  className="rounded-full bg-[rgba(54,36,24,0.9)] px-8 text-white shadow-[0_18px_46px_-28px_rgba(55,24,8,0.6)] hover:bg-[rgba(42,28,19,0.94)]"
                  size="lg"
                >
                  <Link to="/affiliate">立即邀请</Link>
                </Button>
              </div>

              <div className="relative hidden h-full min-h-[250px] md:block">
                <div className="absolute top-10 right-12 flex h-36 w-36 rotate-6 items-center justify-center rounded-[32px] bg-[rgba(255,248,236,0.72)] shadow-[0_24px_54px_-30px_rgba(102,44,6,0.35)]">
                  <Icon
                    className="size-16 text-[#cf4e16]"
                    icon="uil:megaphone"
                  />
                </div>
                <div className="-rotate-6 absolute right-28 bottom-10 flex h-28 w-28 items-center justify-center rounded-[28px] bg-[rgba(255,232,204,0.72)] shadow-[0_22px_50px_-30px_rgba(102,44,6,0.3)]">
                  <Icon
                    className="size-12 text-[#7b4f2d]"
                    icon="uil:envelope-heart"
                  />
                </div>
                <div className="absolute right-8 bottom-7 flex h-32 w-32 items-center justify-center rounded-[32px] bg-[rgba(255,115,28,0.22)] blur-xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-0 bg-white shadow-[0_24px_56px_-40px_rgba(161,166,182,0.34)] dark:bg-[#171311]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[#171717] text-[1.45rem] dark:text-[#f3ede6]">
                  重要通知
                </div>
                <Icon
                  className="size-5 text-[#171717] dark:text-[#afa195]"
                  icon="uil:bell"
                />
              </div>

              <div className="mt-5 rounded-[36px] bg-[linear-gradient(180deg,#ff6f8d_0%,#ff7b8b_34%,#ffa898_100%)] px-5 py-6 text-center text-white shadow-[0_28px_70px_-40px_rgba(255,120,142,0.55)]">
                <div className="font-semibold text-[1.3rem]">超级秒杀</div>
                <div className="mt-2 font-medium text-[1.25rem] text-white/90">
                  -{countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </div>
                <div className="mt-4 font-semibold text-[2.2rem] leading-none tracking-[0.14em]">
                  {LOGIN_PROMO_COUPON_CODE}
                </div>
                <div className="mt-4 font-medium text-[1.15rem]">
                  领券后自动带入套餐页，真实优惠以下单试算为准。
                </div>
              </div>

              <div className="mt-5">
                <Button
                  asChild
                  className="h-12 w-full rounded-full bg-[linear-gradient(90deg,#ffd6e7,#fff0d8)] text-[#f46b8d] shadow-[0_20px_46px_-32px_rgba(255,128,160,0.55)] hover:opacity-95"
                >
                  <Link onClick={handlePromoClaim} to="/subscribe">
                    点击领券下单
                  </Link>
                </Button>
              </div>

              <div className="mt-5 text-[#818791] text-sm leading-7 dark:text-[#aa9d92]">
                {showPinnedOffer
                  ? "优惠窗口仍在倒计时中，越往后越容易错过。建议直接在上方领取后再去套餐页。"
                  : pinnedAnnouncement?.content
                    ? getAnnouncementExcerpt(pinnedAnnouncement.content)
                    : "当前没有额外公告时，这里只保留最重要的优惠提醒。"}
              </div>

              {pinnedAnnouncement?.title && (
                <div className="mt-4 rounded-2xl bg-[#f8fafb] px-4 py-3 text-[#4f5965] text-sm dark:bg-[#201916] dark:text-[#d5c7bb]">
                  {pinnedAnnouncement.title}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getDisplayName(accountIdentifier: string) {
  const value = accountIdentifier.split("@")[0] || accountIdentifier;
  return value.length > 18 ? `${value.slice(0, 18)}...` : value;
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

function getUnitTimeLabel(value?: string) {
  const map: Record<string, string> = {
    Day: "天",
    Hour: "小时",
    Minute: "分钟",
    Month: "月",
    NoLimit: "不限期",
    Year: "年",
  };
  return map[value || "Month"] || value || "月";
}

function getTutorialTitle(index: number, fallbackName: string) {
  if (index === 0) return "IOS | Shadowrocket";
  if (index === 1) return "Windows | Clash";
  if (index === 2) return "安卓 | Clash";
  return fallbackName;
}

function getTutorialSubtitle(index: number) {
  if (index === 0) return "视频教程，保姆教学";
  if (index === 1) return "图文教程，轻松掌握";
  if (index === 2) return "图文教程，轻松掌握";
  return "下载/查看教程";
}

function getGuideDevice(index: number): GuideDevice {
  if (index === 0) return "ios";
  if (index === 1) return "windows";
  return "android";
}

function getGuideCtaLabel(device: GuideDevice) {
  if (device === "ios") return "进入 iOS 教程";
  if (device === "windows") return "进入 Windows 教程";
  return "进入 Android 教程";
}

const guideBackgrounds = [
  "bg-[linear-gradient(180deg,#d7d2ff_0%,#c4bcff_100%)]",
  "bg-[linear-gradient(180deg,#bfe2ff_0%,#a8d0f7_100%)]",
  "bg-[linear-gradient(180deg,#c8efd8_0%,#b8e5cd_100%)]",
];

const platformIcons = ["uil:apple", "uil:windows", "uil:android-alt"];
