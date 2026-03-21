"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
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
import {
  BRAND_DESCRIPTION,
  BRAND_NAME,
  BRAND_TAGLINE,
} from "@/config/index";
import { useGlobalStore } from "@/stores/global";
import EmailAuthForm from "./email/auth-form";
import { OAuthMethods } from "./oauth-methods";
import PhoneAuthForm from "./phone/auth-form";

export default function Main() {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { site, auth } = common;
  const siteName = site.site_name || BRAND_NAME;
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
    <main className="flex min-h-screen items-center bg-[radial-gradient(circle_at_top_left,rgba(25,193,196,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,198,122,0.16),transparent_24%)]">
      <div className="flex size-full flex-auto flex-col lg:flex-row">
        <div className="relative flex bg-center bg-cover lg:w-1/2 lg:flex-auto">
          <div className="absolute inset-0 hidden bg-linear-to-br from-background via-background/70 to-transparent lg:block" />
          <div className="relative flex w-full flex-col items-center justify-center px-5 py-7 md:px-15 lg:items-start lg:py-15">
            <Link className="mb-0 flex flex-col items-center lg:mb-10 lg:items-start" to="/">
              {site.site_logo && (
                <img alt="logo" height={48} src={site.site_logo} width={48} />
              )}
              <span className="mt-3 font-semibold text-2xl">{siteName}</span>
            </Link>
            <div className="mb-5 rounded-full border border-primary/20 bg-background/80 px-4 py-1 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase shadow-sm backdrop-blur-sm">
              {BRAND_NAME} Access
            </div>
            <h1 className="max-w-xl text-center font-bold text-3xl tracking-tight lg:text-left lg:text-5xl">
              Move into your panel with a cleaner entry experience.
            </h1>
            <p className="mt-4 max-w-xl text-center text-muted-foreground leading-7 lg:text-left">
              {siteDescription || BRAND_TAGLINE}
            </p>
            <DotLottieReact
              autoplay
              className="mx-auto hidden w-[275px] lg:mx-0 lg:mt-8 lg:block xl:w-[500px]"
              loop
              src="./assets/lotties/login.json"
            />
            <p className="hidden w-[275px] text-center text-sm text-muted-foreground/90 leading-7 md:w-1/2 lg:block lg:text-left xl:w-[500px]">
              {BRAND_TAGLINE}
            </p>
          </div>
        </div>
        <div className="flex flex-initial justify-center p-6 sm:p-10 lg:flex-auto lg:justify-end lg:p-12">
          <div className="flex w-full flex-col items-center rounded-[2rem] border border-white/40 bg-background/85 p-6 shadow-[0_30px_80px_rgba(18,20,23,0.12)] backdrop-blur-md md:w-[600px] md:p-10 lg:flex-auto">
            <div className="flex w-full flex-col items-stretch justify-center md:w-[400px] lg:h-full">
              <div className="flex flex-col justify-center lg:flex-auto">
                <h1 className="mb-3 text-center font-bold text-2xl tracking-tight">
                  {t("verifyAccount", "Access your account")}
                </h1>
                <div className="mb-6 text-center font-medium text-muted-foreground">
                  {t(
                    "verifyAccountDesc",
                    "Sign in or create an account to continue into the panel."
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
              <div className="flex items-center justify-between border-border/60 border-t pt-6">
                <div className="flex items-center gap-5">
                  <LanguageSwitch />
                  <ThemeSwitch />
                </div>
                <div className="flex gap-2 font-semibold text-primary text-sm">
                  <Link to="/tos">{t("tos", "Terms of Service")}</Link>
                  <span className="text-foreground/30">|</span>
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
