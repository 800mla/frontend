"use client";

import { Link } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Icon } from "@workspace/ui/composed/icon";
import { useTranslation } from "react-i18next";
import { BRAND_DESCRIPTION } from "@/config/index";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;
  const siteDescription = site.site_desc || BRAND_DESCRIPTION;
  const brandName = site.site_name || "冰咖";

  const AUTH_METHODS = [
    {
      key: "email",
      enabled: auth.email.enable,
      children: <EmailAuthForm />,
    },
    {
      key: "mobile",
      enabled: auth.mobile.enable,
      children: <PhoneAuthForm />,
    },
  ].filter((method) => method.enabled);

  const serviceHighlights = [
    {
      icon: "uil:shield-check",
      title: "静默接入",
      description: "登录、续订与账户管理尽量减少多余打扰，把操作留给真正重要的步骤。",
    },
    {
      icon: "uil:route",
      title: "自由切换",
      description: "统一账户入口与清晰的链路状态，帮助用户在不同设备之间快速衔接。",
    },
    {
      icon: "uil:coffee",
      title: "冷萃体验",
      description: "视觉、层级和交互节奏都保持克制，让效率和质感在同一杯里完成。",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,167,122,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(160,216,239,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-border/60 to-transparent lg:block" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <div className="relative hidden w-full overflow-hidden p-6 lg:flex lg:w-[56%] lg:p-8">
          <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-8 right-4 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative flex h-full w-full flex-col justify-between rounded-[36px] border border-border/55 bg-[linear-gradient(145deg,rgba(255,248,242,0.92),rgba(244,236,228,0.74))] p-10 shadow-[0_32px_90px_-48px_rgba(76,54,38,0.45)] backdrop-blur-xl dark:bg-[linear-gradient(145deg,rgba(35,28,24,0.92),rgba(25,20,17,0.76))] xl:p-14">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <Link className="flex items-center gap-3" to="/">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 text-xl font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    冰
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-foreground">
                      {brandName}
                      <span className="text-primary">.</span>
                    </div>
                    <div className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
                      COLD BREW ACCESS
                    </div>
                  </div>
                </Link>
                <div className="rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                  MEMBER ENTRY
                </div>
              </div>

              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                  <Icon className="size-4 text-primary" icon="uil:star" />
                  Keep It Clean. Keep It Fast.
                </div>
                <h1 className="text-5xl font-serif font-medium leading-[1.08] tracking-tight text-foreground xl:text-6xl">
                  登录之后，
                  <br />
                  让每一次连接都像
                  <span className="ml-2 italic text-primary">冷萃落杯</span>
                  一样利落。
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground xl:text-lg">
                  {siteDescription ||
                    "以清晰的账户入口、克制的视觉层级和稳定的管理节奏，让访问、续订与设备切换都保持轻盈。"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {["自由切换", "快速续订", "轻量管理"].map((item) => (
                  <div
                    className="rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-medium text-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {serviceHighlights.map((item) => (
                <div
                  className="rounded-[28px] border border-border/55 bg-background/55 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-sm"
                  key={item.title}
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="size-5" icon={item.icon} />
                  </div>
                  <div className="text-base font-semibold text-foreground">
                    {item.title}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border/45 pt-6 text-sm text-muted-foreground/70">
              <span>&copy; {new Date().getFullYear()} BINGKA CLOUD NETWORK</span>
              <span>Crafted for clean, efficient access.</span>
            </div>
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center px-4 py-6 sm:px-8 lg:w-[44%] lg:px-10 lg:py-10">
          <div className="absolute top-12 h-40 w-40 rounded-full bg-primary/14 blur-3xl lg:right-20" />
          <div className="w-full max-w-[560px]">
            <div className="mb-5 rounded-[30px] border border-border/55 bg-[linear-gradient(145deg,rgba(255,248,242,0.92),rgba(244,236,228,0.72))] p-5 shadow-[0_28px_80px_-44px_rgba(76,54,38,0.45)] backdrop-blur-xl dark:bg-[linear-gradient(145deg,rgba(36,28,24,0.9),rgba(24,19,16,0.78))] lg:hidden">
              <Link className="flex items-center justify-between gap-4" to="/">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {brandName}
                    <span className="text-primary">.</span>
                  </div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    自由切换、清爽续订、轻量管理。
                  </div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-6" icon="uil:coffee" />
                </div>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[34px] border border-border/60 bg-background/82 p-6 shadow-[0_36px_100px_-56px_rgba(76,54,38,0.5)] backdrop-blur-2xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />

              <div className="mb-8 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                    <Icon className="size-3.5" icon="uil:shield-check" />
                    Secure Member Access
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif font-medium tracking-tight text-foreground">
                      欢迎回到冰咖。
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                      {t(
                        "verifyAccountDesc",
                        "Please login or register to continue"
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["清爽", "高效", "低打扰"].map((item) => (
                      <span
                        className="rounded-full border border-border/55 bg-muted/15 px-3 py-1 text-xs font-medium text-foreground/80"
                        key={item}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
              </div>

              <div className="flex h-full w-full flex-col items-stretch justify-center">
                <div className="flex flex-auto flex-col justify-center">
                  {AUTH_METHODS.length === 1
                    ? AUTH_METHODS[0]?.children
                    : AUTH_METHODS[0] && (
                        <Tabs defaultValue={AUTH_METHODS[0].key}>
                          <TabsList className="mb-7 grid w-full grid-cols-2 rounded-full border border-border/55 bg-muted/15 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                            {AUTH_METHODS.map((item) => (
                              <TabsTrigger
                                className="rounded-full text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                key={item.key}
                                value={item.key}
                              >
                                {t(`methods.${item.key}`)}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          {AUTH_METHODS.map((item) => (
                            <TabsContent key={item.key} value={item.key}>
                              {item.children}
                            </TabsContent>
                          ))}
                        </Tabs>
                      )}
                  {AUTH_METHODS.length === 0 && (
                    <div className="rounded-[28px] border border-border/60 bg-muted/20 px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                      <div className="mb-2 font-semibold text-foreground">
                        登录方式加载中
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        如果这里长时间没有出现输入框，通常是 API 未连接，或后台尚未开启邮箱/手机号登录。
                      </p>
                    </div>
                  )}
                </div>

                <div className="py-8">
                  <OAuthMethods />
                </div>

                <div className="flex flex-col items-start justify-between gap-4 rounded-[24px] border border-border/50 bg-muted/10 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="text-xs leading-6 text-muted-foreground">
                    登录即表示你已阅读并接受相关协议与隐私说明。
                  </div>
                  <div className="flex gap-3 text-xs font-semibold text-muted-foreground transition-colors hover:*:text-primary">
                    <Link to="/tos">{t("tos", "Terms of Service")}</Link>
                    <span>|</span>
                    <Link to="/privacy-policy">
                      {t("privacyPolicy", "Privacy Policy")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
