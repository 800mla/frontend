"use client";

import { Link } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { Fragment, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BRAND_NAME } from "@/config/index";
import { useLandingNavigation } from "@/hooks/use-landing-navigation";
import { useGlobalStore } from "@/stores/global";

interface CustomData {
  community?: {
    discord?: string;
    facebook?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    telegram?: string;
    twitter?: string;
  };
  contacts?: {
    address?: string;
    email?: string;
    telephone?: string;
  };
  website?: string;
}

export default function Footer() {
  const { t } = useTranslation("components");
  const navigateToLandingSection = useLandingNavigation();
  const { common } = useGlobalStore();
  const { site } = common;

  const customData = useMemo<CustomData>(() => {
    try {
      return JSON.parse(site.custom_data || "{}");
    } catch {
      return {};
    }
  }, [site.custom_data]);

  const links = useMemo(
    () => [
      {
        name: "email",
        icon: "uil:envelope",
        href: customData.contacts?.email
          ? `mailto:${customData.contacts.email}`
          : undefined,
      },
      {
        name: "telegram",
        icon: "uil:telegram",
        href: customData.community?.telegram,
      },
      {
        name: "twitter",
        icon: "uil:twitter",
        href: customData.community?.twitter,
      },
      {
        name: "discord",
        icon: "uil:discord",
        href: customData.community?.discord,
      },
      {
        name: "instagram",
        icon: "uil:instagram",
        href: customData.community?.instagram,
      },
      {
        name: "linkedin",
        icon: "uil:linkedin",
        href: customData.community?.linkedin,
      },
      {
        name: "github",
        icon: "uil:github",
        href: customData.community?.github,
      },
      {
        name: "facebook",
        icon: "uil:facebook",
        href: customData.community?.facebook,
      },
    ],
    [customData]
  );
  return (
    <footer className="border-border/30 border-t bg-background">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link className="font-bold text-xl tracking-wide" to="/">
              {site.site_name || BRAND_NAME}
              <span className="text-primary">.</span>
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
              为全球专业人士打造的高级网络连接服务。随时随地，保持在最专注的状态。
            </p>
          </div>
          <div>
            <h4 className="mb-5 font-bold text-xs uppercase tracking-[2px]">
              探索
            </h4>
            <ul className="space-y-3">
              <li>
                <button
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  onClick={() => navigateToLandingSection("features")}
                  type="button"
                >
                  工艺哲学
                </button>
              </li>
              <li>
                <button
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  onClick={() => navigateToLandingSection("menu")}
                  type="button"
                >
                  方案菜单
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-5 font-bold text-xs uppercase tracking-[2px]">
              支持
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  to="/tos"
                >
                  {t("footer.tos", "Terms of Service")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground text-sm transition-colors hover:text-primary"
                  to="/privacy-policy"
                >
                  {t("footer.privacyPolicy", "Privacy Policy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 opacity-30" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground">
            &copy; 2026 {site.site_name || BRAND_NAME} CLOUD NETWORK. CRAFTED
            WITH CARE.
          </p>
          <nav className="flex items-center gap-3">
            {links
              .filter((item) => item.href)
              .map((item, index) => (
                <Fragment key={index}>
                  {index !== 0 && (
                    <Separator
                      className="h-4 opacity-30"
                      orientation="vertical"
                    />
                  )}
                  <a
                    aria-label={t(
                      `footer.social.${item.name}`,
                      `Visit our ${item.name}`
                    )}
                    href={item.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon
                      className="size-4 text-muted-foreground transition-colors hover:text-primary"
                      icon={item.icon}
                    />
                  </a>
                </Fragment>
              ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
