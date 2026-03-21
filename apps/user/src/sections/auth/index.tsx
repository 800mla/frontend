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

  return (
    <main className="flex h-full min-h-screen items-center bg-background">
      <div className="flex size-full flex-auto flex-col lg:flex-row">
        <div className="relative hidden w-full flex-col justify-center overflow-hidden bg-muted/30 p-12 lg:flex lg:w-1/2">
          <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px]" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <Link className="flex items-center gap-2" to="/">
              <div className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                冰咖<span className="text-primary">.</span>
              </div>
            </Link>

            <div className="mb-20">
              <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                CONNECTING THE WORLD
              </div>
              <h1 className="text-4xl font-medium leading-tight text-foreground md:text-5xl">
                登录系统，
                <br />
                品鉴<span className="italic text-accent">冷萃般</span>的纯粹网络。
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:w-4/5">
                {siteDescription ||
                  "依托高级加密协议与智能链路同步技术，为您提供极致稳定的中转服务。"}
              </p>
            </div>

            <div className="text-sm text-muted-foreground/60">
              &copy; {new Date().getFullYear()} 冰咖 CLOUD NETWORK. CRAFTED
              WITH CARE.
            </div>
          </div>
        </div>
        <div className="flex flex-auto items-center justify-center p-6 sm:p-12 lg:w-1/2">
          <div className="flex w-full max-w-[450px] flex-col items-center rounded-2xl border border-border bg-card p-8 shadow-xl sm:p-10">
            <div className="mb-8 flex w-full justify-center lg:hidden">
              <Link className="flex items-center gap-2" to="/">
                <div className="flex items-center text-3xl font-bold tracking-tight text-foreground">
                  冰咖<span className="text-primary">.</span>
                </div>
              </Link>
            </div>

            <div className="flex h-full w-full flex-col items-stretch justify-center">
              <div className="flex flex-auto flex-col justify-center">
                <h2 className="mb-2 text-center text-2xl font-bold">
                  {t("verifyAccount", "Verify Your Account")}
                </h2>
                <div className="mb-8 text-center text-sm font-medium text-muted-foreground">
                  {t(
                    "verifyAccountDesc",
                    "Please login or register to continue"
                  )}
                </div>
                {AUTH_METHODS.length === 1
                  ? AUTH_METHODS[0]?.children
                  : AUTH_METHODS[0] && (
                      <Tabs defaultValue={AUTH_METHODS[0].key}>
                        <TabsList className="mb-6 flex w-full *:flex-1">
                          {AUTH_METHODS.map((item) => (
                            <TabsTrigger key={item.key} value={item.key}>
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
              </div>
              <div className="py-8">
                <OAuthMethods />
              </div>
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-5">
                  <LanguageSwitch />
                  <ThemeSwitch />
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
    </main>
  );
}
