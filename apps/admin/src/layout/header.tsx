import { Link, useLocation } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { LanguageSwitch } from "@workspace/ui/composed/language-switch";
import { ThemeSwitch } from "@workspace/ui/composed/theme-switch";
import { Fragment, useMemo } from "react";
import { findNavByUrl, useNavs } from "./navs";
import TimezoneSwitch from "./timezone-switch";
import { UserNav } from "./user-nav";

export function Header() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const navs = useNavs();
  const items = useMemo(() => findNavByUrl(navs, pathname), [pathname]);
  const current = items.at(-1);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 lg:px-6">
      <div className="flex min-h-16 items-center gap-3 rounded-[26px] border border-white/70 bg-white/72 px-3 py-3 shadow-[0_18px_45px_-32px_rgba(121,93,67,0.22)] backdrop-blur dark:border-white/10 dark:bg-[#1a1512]/78">
        <div className="flex flex-1 items-center gap-3">
          <SidebarTrigger className="size-9 rounded-2xl border border-[#eadfd3] bg-[#fffaf5] text-[#7f5c43] hover:bg-[#f5ede4] hover:text-[#6c4d37] dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96] dark:hover:bg-white/10" />
          <Separator
            className="mr-1 hidden h-8 bg-[#e7d9cb] md:block dark:bg-white/10"
            orientation="vertical"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-[#9b8a7b] text-[11px] uppercase tracking-[0.18em] dark:text-white/40">
              <Icon className="size-3.5" icon="uil:coffee" />
              Bingka Admin Console
            </div>
            <div className="flex min-w-0 flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
              <div className="truncate font-semibold text-[#2f241d] text-lg tracking-tight dark:text-white">
                {current?.title || "Dashboard"}
              </div>
              <Breadcrumb>
                <BreadcrumbList className="text-[#7c6c60] text-sm dark:text-white/55">
                  {items.map((item, index) => (
                    <Fragment key={item?.title}>
                      {index !== items.length - 1 && (
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <Link to={item?.url || "/dashboard"}>
                              {item?.title}
                            </Link>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      )}
                      {index < items.length - 1 && <BreadcrumbSeparator />}
                      {index === items.length - 1 && (
                        <BreadcrumbPage className="text-[#4d3b2f] dark:text-white">
                          {item?.title}
                        </BreadcrumbPage>
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-[22px] border border-[#eadfd3] bg-[#fffaf5]/90 px-2 py-2 dark:border-white/10 dark:bg-white/6">
          <LanguageSwitch />
          <TimezoneSwitch />
          <ThemeSwitch />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
