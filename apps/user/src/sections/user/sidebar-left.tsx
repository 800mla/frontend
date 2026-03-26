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
      <SidebarHeader className="px-2 pt-1 pb-4">
        <div className="font-semibold text-[11px] text-primary/85 uppercase tracking-[0.22em]">
          BINGKA PANEL
        </div>
        <div className="mt-2 font-medium font-serif text-foreground text-lg">
          用户控制台
        </div>
        <p className="mt-1 text-muted-foreground text-sm leading-6">
          以更少的干扰完成主要操作。
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-5 px-1 pt-1">
        <SidebarMenu>
          {navs.map((nav) => (
            <SidebarGroup key={nav.title}>
              {nav.items && (
                <SidebarGroupLabel className="px-2 font-medium text-[11px] text-muted-foreground/78 uppercase tracking-[0.16em]">
                  {t(nav.title)}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {(nav.items || [nav]).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="h-10 rounded-2xl px-3 font-medium text-foreground/76 transition-all hover:bg-background/65 hover:text-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-[0_10px_24px_-20px_rgba(76,54,38,0.28)]"
                        isActive={item.url === location.pathname}
                        size="default"
                        tooltip={t(item.title)}
                        variant="default"
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
