"use client";

import { Link } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Icon } from "@workspace/ui/composed/icon";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { useTranslation } from "react-i18next";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;
  const brandName = site.site_name || "冰咖";

  const configuredAuthMethods = [
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
  const AUTH_METHODS =
    configuredAuthMethods.length > 0
      ? configuredAuthMethods
      : [
          {
            key: "email",
            enabled: true,
            children: <EmailAuthForm />,
          },
        ];
  const isUsingFallbackAuth = configuredAuthMethods.length === 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,167,122,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(160,216,239,0.08),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-gradient-to-b from-transparent via-border/60 to-transparent lg:block" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <div className="relative hidden w-full overflow-hidden p-6 lg:flex lg:w-[56%] lg:p-8">
          <div className="absolute top-10 left-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-4 bottom-8 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />

          <div className="relative flex h-full w-full flex-col justify-between rounded-[32px] border border-border/50 bg-[linear-gradient(145deg,rgba(255,248,242,0.9),rgba(244,236,228,0.68))] p-10 shadow-[0_28px_80px_-52px_rgba(76,54,38,0.38)] backdrop-blur-xl xl:p-14 dark:bg-[linear-gradient(145deg,rgba(35,28,24,0.88),rgba(25,20,17,0.72))]">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <Link className="flex items-center gap-3" to="/">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/12 font-semibold text-primary text-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                    冰
                  </div>
                  <div>
                    <div className="font-bold text-2xl text-foreground tracking-tight">
                      {brandName}
                      <span className="text-primary">.</span>
                    </div>
                    <div className="text-muted-foreground text-xs uppercase tracking-[0.34em]">
                      {t("heroBadge", "Cold Brew Access")}
                    </div>
                  </div>
                </Link>
                <div className="rounded-full border border-primary/16 bg-primary/8 px-4 py-2 font-semibold text-[11px] text-primary uppercase tracking-[0.24em]">
                  {t("heroEntry", "Quiet Entry")}
                </div>
              </div>

              <div className="max-w-[760px]">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/55 bg-background/52 px-4 py-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.22em] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                  <Icon className="size-3.5 text-primary" icon="uil:coffee" />
                  {t("heroBadge", "Cold Brew Access")}
                </div>
                <div className="max-w-[680px] font-semibold text-[2.45rem] text-foreground leading-[1.22] tracking-[-0.03em] xl:text-[3.6rem]">
                  {t("heroTitleLine1", "冰咖把入口留得干净，")}
                  <br />
                  {t("heroTitleLine2", "把连接做得稳定。")}
                </div>
                <p className="mt-5 max-w-md text-[1.02rem] text-muted-foreground leading-8 xl:text-[1.22rem]">
                  {t("heroSubtitleLine1", "安静一点，")}
                  <br />
                  {t("heroSubtitleLine2", "就能更快连上。")}
                </p>
              </div>

              <div className="max-w-xl border-border/45 border-t pt-6">
                <div className="font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.28em]">
                  {t("heroMeta", "Clean / Quiet / Efficient")}
                </div>
                <p className="mt-3 text-base text-muted-foreground leading-8">
                  {t("heroFootnote", "少一点打扰，多一点确定感。")}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-border/45 border-t pt-6 text-muted-foreground/70 text-sm">
              <span>
                &copy; {new Date().getFullYear()} BINGKA CLOUD NETWORK
              </span>
              <span>{t("heroClosing", "Keep it light.")}</span>
            </div>
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center px-4 py-6 sm:px-8 lg:w-[44%] lg:px-10 lg:py-10">
          <div className="absolute top-12 h-40 w-40 rounded-full bg-primary/14 blur-3xl lg:right-20" />
          <div className="w-full max-w-[560px]">
            <div className="mb-5 rounded-[28px] border border-border/50 bg-[linear-gradient(145deg,rgba(255,248,242,0.9),rgba(244,236,228,0.7))] p-5 shadow-[0_24px_70px_-48px_rgba(76,54,38,0.4)] backdrop-blur-xl lg:hidden dark:bg-[linear-gradient(145deg,rgba(36,28,24,0.88),rgba(24,19,16,0.76))]">
              <Link className="flex items-center justify-between gap-4" to="/">
                <div>
                  <div className="font-bold text-2xl text-foreground tracking-tight">
                    {brandName}
                    <span className="text-primary">.</span>
                  </div>
                  <div className="mt-1 text-muted-foreground text-sm leading-6">
                    {t("heroCompact", "把入口留得干净，把连接做得稳定。")}
                  </div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-5" icon="uil:coffee" />
                </div>
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-[30px] border border-border/55 bg-background/86 p-6 shadow-[0_28px_82px_-54px_rgba(76,54,38,0.42)] backdrop-blur-2xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />

              <div className="mb-7 flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/18 bg-primary/9 px-3 py-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.2em]">
                    <Icon className="size-3.5" icon="uil:shield-check" />
                    {t("secureEntry", "Secure Member Access")}
                  </div>
                  <div>
                    <h2 className="font-medium font-serif text-3xl text-foreground tracking-tight">
                      {t("welcomeBack", "欢迎回到冰咖。")}
                    </h2>
                    <p className="mt-2 max-w-md text-muted-foreground text-sm leading-7">
                      {t("welcomeHint", "把入口留给你，把喧闹留在外面。")}
                    </p>
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
                          <TabsList className="mb-6 grid w-full grid-cols-2 rounded-full border border-border/50 bg-muted/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                            {AUTH_METHODS.map((item) => (
                              <TabsTrigger
                                className="rounded-full font-medium text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
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
                  {isUsingFallbackAuth && (
                    <div className="mb-5 rounded-[22px] border border-primary/16 bg-primary/8 px-4 py-3 text-muted-foreground text-sm leading-6">
                      {t(
                        "authFallbackNotice",
                        "当前 API 已连接，但站点配置没有返回可用登录方式。这里先回退到邮箱入口，方便你继续本地测试；后端正式启用后会自动按配置展示。"
                      )}
                    </div>
                  )}
                </div>

                <div className="py-8">
                  <OAuthMethods />
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-border/45 border-t pt-5 sm:flex-row sm:items-center">
                  <div className="text-muted-foreground text-xs leading-6">
                    {t(
                      "legalNotice",
                      "登录即表示你同意相关服务条款与隐私说明。"
                    )}
                  </div>
                  <div className="flex gap-3 font-semibold text-muted-foreground text-xs transition-colors hover:*:text-primary">
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
