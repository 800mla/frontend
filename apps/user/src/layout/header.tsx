import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@workspace/ui/components/button";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { useTranslation } from "react-i18next";
import { useLandingNavigation } from "@/hooks/use-landing-navigation";
import { BRAND_NAME } from "@/config/index";
import { useGlobalStore } from "@/stores/global";
import { UserNav } from "./user-nav";

export default function Header() {
  const { t } = useTranslation("components");
  const navigateToLandingSection = useLandingNavigation();

  const { common, user } = useGlobalStore();
  const { site } = common;
  const Logo = (
    <Link className="flex items-center gap-2 text-xl font-bold tracking-wide" to="/">
      {site.site_logo && (
        <img alt="logo" height={36} src={site.site_logo} width={36} />
      )}
      <span>
        {site.site_name || BRAND_NAME}
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <nav className="flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {Logo}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <button
            className="hidden text-sm text-muted-foreground transition-colors hover:text-primary md:inline-block"
            onClick={() => navigateToLandingSection("features")}
            type="button"
          >
            连接哲学
          </button>
          <button
            className="hidden text-sm text-muted-foreground transition-colors hover:text-primary md:inline-block"
            onClick={() => navigateToLandingSection("menu")}
            type="button"
          >
            方案菜单
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
              {t("loginRegister", "Login / Register")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
