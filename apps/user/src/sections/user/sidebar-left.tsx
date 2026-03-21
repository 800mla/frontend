"use client";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { useTranslation } from "react-i18next";
import { useNavs } from "@/layout/navs";

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation("menu");
  const location = useLocation();
  const navs = useNavs();
  return (
    <Sidebar collapsible="none" side="left" {...props}>
      <SidebarHeader className="rounded-[24px] border border-border/55 bg-background/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          BINGKA PANEL
        </div>
        <div className="mt-2 text-xl font-serif font-medium text-foreground">
          用户控制台
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          保持访问、续订与账户管理的节奏感，让每一步都更清晰。
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-5 px-1 pt-4">
        <SidebarMenu>
          {navs.map((nav) => (
            <SidebarGroup key={nav.title}>
              {nav.items && (
                <SidebarGroupLabel className="px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  {t(nav.title)}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {(nav.items || [nav]).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="h-11 rounded-2xl px-3 font-medium transition-all data-[active=true]:bg-background data-[active=true]:shadow-[0_12px_28px_-22px_rgba(76,54,38,0.5)] data-[active=true]:text-foreground hover:bg-background/70"
                        isActive={item.url === location.pathname}
                        size="lg"
                        tooltip={t(item.title)}
                        variant="outline"
                      >
                        <Link to={item.url || "/"}>
                          {item.icon && <Icon icon={item.icon} />}
                          <span>{t(item.title)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
