import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { buttonVariants } from "@workspace/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Icon } from "@workspace/ui/composed/icon";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { cn } from "@workspace/ui/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLandingNavigation } from "@/hooks/use-landing-navigation";
import { BRAND_NAME } from "@/config/index";
import { useGlobalStore } from "@/stores/global";
import { UserNav } from "./user-nav";

type HeaderItem = {
  label: string;
  icon: string;
  to?: string;
  section?: string;
  requiresAuth?: boolean;
};

export default function Header() {
  const { t } = useTranslation("components");
  const navigateToLandingSection = useLandingNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { common, user } = useGlobalStore();
  const { site } = common;
  const brandName = site.site_name || BRAND_NAME;

  const primaryItems: HeaderItem[] = user
    ? [
        {
          label: t("header.myDashboard", "我的面板"),
          icon: "uil:apps",
          to: "/profile",
        },
        {
          label: t("header.purchasePlans", "购买套餐"),
          icon: "uil:box",
          to: "/subscribe",
        },
        {
          label: t("header.myInvite", "我的邀请"),
          icon: "uil:share-alt",
          to: "/affiliate",
        },
      ]
    : [
        {
          label: t("header.myDashboard", "我的面板"),
          icon: "uil:apps",
          to: "/auth",
          requiresAuth: true,
        },
        {
          label: t("header.purchasePlans", "购买套餐"),
          icon: "uil:box",
          to: "/purchasing",
        },
        {
          label: t("header.myInvite", "我的邀请"),
          icon: "uil:share-alt",
          to: "/auth",
          requiresAuth: true,
        },
      ];

  const allMenuItems: HeaderItem[] = user
    ? [
        {
          label: t("menu.document", "使用文档"),
          icon: "uil:book-alt",
          to: "/document",
        },
        {
          label: t("header.purchasePlans", "购买套餐"),
          icon: "uil:box",
          to: "/subscribe",
        },
        {
          label: t("menu.order", "订单列表"),
          icon: "uil:notes",
          to: "/order",
        },
        {
          label: t("menu.wallet", "财务中心"),
          icon: "uil:wallet",
          to: "/wallet",
        },
        {
          label: t("header.myInvite", "我的邀请"),
          icon: "uil:share-alt",
          to: "/affiliate",
        },
        {
          label: t("menu.profile", "个人中心"),
          icon: "uil:user",
          to: "/profile",
        },
        {
          label: t("menu.ticket", "我的工单"),
          icon: "uil:message",
          to: "/ticket",
        },
        {
          label: t("header.announcement", "公告通知"),
          icon: "uil:megaphone",
          to: "/announcement",
        },
      ]
    : [
        {
          label: t("menu.document", "使用文档"),
          icon: "uil:book-alt",
          to: "/document",
        },
        {
          label: t("header.purchasePlans", "购买套餐"),
          icon: "uil:box",
          to: "/purchasing",
        },
        {
          label: t("header.myDashboard", "我的面板"),
          icon: "uil:apps",
          to: "/auth",
          requiresAuth: true,
        },
        {
          label: t("header.myInvite", "我的邀请"),
          icon: "uil:share-alt",
          to: "/auth",
          requiresAuth: true,
        },
        {
          label: t("menu.profile", "个人中心"),
          icon: "uil:user",
          to: "/auth",
          requiresAuth: true,
        },
        {
          label: t("menu.ticket", "我的工单"),
          icon: "uil:message",
          to: "/auth",
          requiresAuth: true,
        },
      ];

  const moreItems: HeaderItem[] = user
    ? [
        {
          label: t("header.profile", "账户设置"),
          icon: "uil:user",
          to: "/profile",
        },
        {
          label: t("header.document", "文档中心"),
          icon: "uil:book-alt",
          to: "/document",
        },
        {
          label: t("header.announcement", "公告通知"),
          icon: "uil:megaphone",
          to: "/announcement",
        },
      ]
    : [
        {
          label: t("header.philosophy", "连接哲学"),
          icon: "uil:coffee",
          section: "features",
        },
        {
          label: t("header.menu", "方案菜单"),
          icon: "uil:shop",
          section: "menu",
        },
      ];

  const handleNavAction = async (item: {
    to?: string;
    section?: string;
    requiresAuth?: boolean;
  }) => {
    setMobileOpen(false);
    if (item.requiresAuth && !user) {
      toast.info(t("header.loginRequired", "请先登录后再继续"));
      await navigate({ to: "/auth" });
      return;
    }
    if (item.section) {
      await navigateToLandingSection(item.section);
      return;
    }
    if (item.to) {
      await navigate({ to: item.to });
    }
  };

  const handlePrimaryAction = async () => {
    setMobileOpen(false);
    if (user) {
      await navigate({ to: "/subscribe" });
      return;
    }
    await navigate({ to: "/purchasing" });
  };

  const isItemActive = (item: HeaderItem) => {
    if (!item.to) return false;
    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  };

  const Logo = (
    <Link className="group flex items-center gap-3" to="/">
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background/90 shadow-sm shadow-black/5 transition-transform duration-300 group-hover:scale-[1.02]">
        {site.site_logo ? (
          <img
            alt="logo"
            className="size-7 rounded-xl object-cover"
            height={40}
            src={site.site_logo}
            width={40}
          />
        ) : (
          <span className="text-sm font-semibold tracking-[0.18em] text-primary">
            {brandName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <span className="font-semibold text-[0.95rem] tracking-[0.18em] text-foreground">
        {brandName}
      </span>
    </Link>
  );

  const navButtonClassName = (active: boolean) =>
    cn(
      "rounded-full px-4 py-2 text-sm transition-all duration-200",
      active
        ? "bg-primary/12 text-primary shadow-sm shadow-primary/10"
        : "text-muted-foreground hover:bg-background hover:text-foreground"
    );

  const mobileItemClassName = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
      active
        ? "border-primary/30 bg-primary/10 text-foreground"
        : "border-border/60 bg-background/70 text-foreground hover:bg-accent/70"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container flex min-h-[4.5rem] items-center gap-3 py-3 md:gap-6">
        <nav className="min-w-0 flex items-center gap-6">
          {Logo}
        </nav>
        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/50 bg-muted/35 px-2 py-1 shadow-sm shadow-black/5">
            {primaryItems.map((item) => {
              return (
                <button
                  className={navButtonClassName(isItemActive(item))}
                  key={item.label}
                  onClick={() => handleNavAction(item)}
                  type="button"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/80 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <Icon className="size-4" icon="lucide:menu" />
                <span>{t("header.allMenu", "全部菜单")}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[720px] rounded-[28px] border border-border/60 bg-background/95 p-5 shadow-[0_28px_80px_-50px_rgba(0,0,0,0.3)]"
              sideOffset={14}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {t("header.allMenu", "全部菜单")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("header.mobileDescription", "快速进入核心功能与账户操作")}
                  </div>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {allMenuItems.map((item) => (
                  <button
                    className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-[22px] border border-border/55 bg-muted/15 px-3 py-4 text-center transition-colors hover:border-primary/25 hover:bg-primary/8"
                    key={item.label}
                    onClick={() => handleNavAction(item)}
                    type="button"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-background text-foreground shadow-sm">
                      <Icon className="size-5" icon={item.icon} />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            className={buttonVariants({
              size: "sm",
            })}
            onClick={handlePrimaryAction}
            type="button"
          >
            {user
              ? t("header.buyNow", "立即续费")
              : t("header.startNow", "立即购买")}
          </button>
          <LanguageSwitch />
          <ThemeSwitch />
          <UserNav />
          {!user && (
            <Link
              className={buttonVariants({
                size: "sm",
                variant: "outline",
              })}
              to="/auth"
            >
              {t("loginRegister", "登录")}
            </Link>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <button
            className={buttonVariants({
              size: "sm",
            })}
            onClick={handlePrimaryAction}
            type="button"
          >
            {user
              ? t("header.buyNow", "续费")
              : t("header.startNow", "购买")}
          </button>
          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex size-10 items-center justify-center rounded-full border border-border/50 bg-background/80 text-foreground transition-colors hover:bg-accent"
                type="button"
              >
                <Icon className="size-5" icon="lucide:menu" />
              </button>
            </SheetTrigger>
            <SheetContent className="w-[88vw] max-w-sm border-l border-border/60 bg-background/95 px-0">
              <SheetHeader className="border-b border-border/40 px-5 pb-4">
                <SheetTitle className="text-left">{brandName}</SheetTitle>
                <SheetDescription className="text-left">
                  {t("header.mobileDescription", "快速进入核心功能与账户操作")}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
                <div className="flex flex-col gap-2">
                  {primaryItems.map((item) => (
                    <button
                      className={mobileItemClassName(isItemActive(item))}
                      key={item.label}
                      onClick={() => handleNavAction(item)}
                      type="button"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/60">
                        <Icon className="size-5 text-muted-foreground" icon={item.icon} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {moreItems.map((item) => (
                    <button
                      className={mobileItemClassName(false)}
                      key={item.label}
                      onClick={() => handleNavAction(item)}
                      type="button"
                    >
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-muted/60">
                        <Icon className="size-5 text-muted-foreground" icon={item.icon} />
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/25 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {t("header.appearance", "外观与语言")}
                  </span>
                  <div className="flex items-center gap-2">
                    <LanguageSwitch />
                    <ThemeSwitch />
                  </div>
                </div>
                {!user && (
                  <Link
                    className={buttonVariants({
                      size: "lg",
                      variant: "outline",
                    })}
                    onClick={() => setMobileOpen(false)}
                    to="/auth"
                  >
                    {t("loginRegister", "登录")}
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
