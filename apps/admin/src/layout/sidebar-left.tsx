import { Link, useLocation } from "@tanstack/react-router";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import React, { useState } from "react";
import { useGlobalStore } from "@/stores/global";
import { type NavItem, useNavs } from "./navs";

function hasChildren(obj: any): obj is { items: any[] } {
  return (
    obj && Array.isArray((obj as any).items) && (obj as any).items.length > 0
  );
}

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { common } = useGlobalStore();
  const { site } = common;
  const navs = useNavs();
  const pathname = useLocation({ select: (location) => location.pathname });
  const { state, isMobile } = useSidebar();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      navs.forEach((nav) => {
        if (hasChildren(nav) && next[nav.title] === undefined) {
          next[nav.title] = nav.defaultOpen ?? true;
        }
      });
      return next;
    });
  }, [navs]);

  const handleToggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const normalize = (p: string) =>
    p.endsWith("/") && p !== "/" ? p.replace(/\/+$/, "") : p;
  const isActiveUrl = (url: string) => {
    const path = normalize(pathname);
    const target = normalize(url);
    if (target === "/dashboard") return path === target;
    if (path === target) return true;
    return path.startsWith(`${target}/`);
  };

  const isGroupActive = (nav: NavItem) =>
    (hasChildren(nav) && nav.items?.some((i: any) => isActiveUrl(i.url))) ||
    ("url" in nav && nav.url ? isActiveUrl(nav.url as string) : false);

  React.useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      navs.forEach((nav) => {
        if (hasChildren(nav) && isGroupActive(nav)) next[nav.title] = true;
      });
      return next;
    });
  }, [pathname, navs]);

  const renderCollapsedFlyout = (nav: NavItem) => {
    const ParentButton = (
      <SidebarMenuButton
        aria-label={nav.title}
        className="h-10 w-10 justify-center rounded-2xl border border-transparent text-[#715541] transition-all hover:border-[#e6d6c7] hover:bg-[#f8f0e7] hover:text-[#5c4332] dark:text-[#e2bc96] dark:hover:border-white/10 dark:hover:bg-white/10 dark:hover:text-white"
        isActive={false}
        size="sm"
      >
        {"url" in nav && nav.url ? (
          <Link to={nav.url as string}>
            {"icon" in nav && (nav as any).icon ? (
              <Icon className="size-4" icon={(nav as any).icon} />
            ) : null}
          </Link>
        ) : "icon" in nav && (nav as any).icon ? (
          <Icon className="size-4" icon={(nav as any).icon} />
        ) : null}
      </SidebarMenuButton>
    );

    if (!hasChildren(nav)) return ParentButton;

    return (
      <HoverCard closeDelay={200} openDelay={40}>
        <HoverCardTrigger asChild>{ParentButton}</HoverCardTrigger>
        <HoverCardContent
          align="start"
          avoidCollisions
          className="z-[9999] w-64 rounded-[22px] border border-[#eadfd3] bg-white/96 p-0 shadow-[0_22px_54px_-34px_rgba(121,93,67,0.28)] dark:border-white/10 dark:bg-[#1c1714]/96"
          collisionPadding={8}
          side="right"
          sideOffset={10}
        >
          <div className="flex items-center gap-2 border-[#eadfd3] border-b px-3 py-3 dark:border-white/10">
            {"icon" in nav && (nav as any).icon ? (
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#f6ebe0] text-[#8d6748] dark:bg-white/8 dark:text-[#e2bc96]">
                <Icon className="size-4" icon={(nav as any).icon} />
              </div>
            ) : null}
            <span className="truncate font-medium text-[#6f5c4f] text-xs uppercase tracking-[0.14em] dark:text-white/50">
              {nav.title}
            </span>
          </div>

          <ul className="p-2">
            {nav.items?.map((item: any) => (
              <li key={item.title}>
                <Link
                  className={[
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                    isActiveUrl(item.url)
                      ? "bg-[#f4e7da] text-[#5f4330] dark:bg-white/10 dark:text-white"
                      : "text-[#6f5c4f] hover:bg-[#faf2ea] dark:text-white/70 dark:hover:bg-white/6",
                  ].join(" ")}
                  to={item.url}
                >
                  {item.icon && <Icon className="size-4" icon={item.icon} />}
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <Sidebar
      className="border-r-0"
      collapsible="icon"
      variant="floating"
      {...props}
    >
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto rounded-[24px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fff8f2_0%,#f6ede4_100%)] px-3 py-3 shadow-[0_16px_40px_-32px_rgba(121,93,67,0.28)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#2a211c_0%,#1d1714_100%)]"
              size="sm"
            >
              <Link to="/">
                <div className="flex aspect-square size-10 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-white/10">
                  <img
                    alt="logo"
                    className="size-full"
                    height={24}
                    src={site.site_logo || "/favicon.svg"}
                    width={24}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#2f241d] text-sm dark:text-white">
                    {site.site_name}
                  </span>
                  <span className="truncate text-[#7d6b5e] text-xs dark:text-white/55">
                    Admin Control Room
                  </span>
                  <span className="truncate text-[#9b8a7b] text-[11px] dark:text-white/35">
                    {site.site_desc}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-1 pb-3">
        <SidebarMenu>
          {!isMobile && state === "collapsed"
            ? navs.map((nav) => (
                <SidebarMenuItem className="mx-auto" key={nav.title}>
                  {renderCollapsedFlyout(nav)}
                </SidebarMenuItem>
              ))
            : navs.map((nav) => {
                if (hasChildren(nav)) {
                  const isOpen = openGroups[nav.title] ?? false;
                  return (
                    <SidebarGroup className="py-1.5" key={nav.title}>
                      <SidebarMenuButton
                        className={cn(
                          "mb-2 flex h-10 w-full items-center justify-between rounded-2xl px-3 text-[#4f3d31] hover:bg-[#f7efe6] hover:text-[#2f241d] dark:text-white/78 dark:hover:bg-white/6 dark:hover:text-white"
                        )}
                        isActive={false}
                        onClick={() => handleToggleGroup(nav.title)}
                        size="sm"
                        style={{ fontWeight: 500 }}
                        tabIndex={0}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {"icon" in nav && (nav as any).icon ? (
                            <div className="flex size-7 items-center justify-center rounded-xl bg-[#f2e5d8] text-[#8b6242] dark:bg-white/8 dark:text-[#e2bc96]">
                              <Icon
                                className="size-4 shrink-0"
                                icon={(nav as any).icon}
                              />
                            </div>
                          ) : null}
                          <span className="truncate text-sm">{nav.title}</span>
                        </span>
                        <Icon
                          className={`ml-2 size-4 text-[#9a7d65] transition-transform dark:text-white/35 ${isOpen ? "" : "-rotate-90"}`}
                          icon="mdi:chevron-down"
                        />
                      </SidebarMenuButton>
                      {isOpen && (
                        <SidebarGroupContent className="px-3">
                          <SidebarMenu>
                            {nav.items?.map((item: any) => (
                              <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                  asChild
                                  className="h-9 rounded-xl px-3 text-[#6e5b4f] transition-colors hover:bg-[#fcf4eb] hover:text-[#2f241d] data-[active=true]:bg-[#efe0d0] data-[active=true]:text-[#5c4332] dark:text-white/62 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white dark:hover:bg-white/6 dark:hover:text-white"
                                  isActive={isActiveUrl(item.url)}
                                  size="sm"
                                  tooltip={item.title}
                                >
                                  <Link to={item.url}>
                                    {item.icon && (
                                      <Icon
                                        className="size-4"
                                        icon={item.icon}
                                      />
                                    )}
                                    <span className="text-sm">
                                      {item.title}
                                    </span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      )}
                    </SidebarGroup>
                  );
                }

                return (
                  <SidebarGroup className="py-1.5" key={nav.title}>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            asChild={"url" in nav && !!(nav as any).url}
                            className="h-10 rounded-2xl px-3 text-[#4f3d31] hover:bg-[#f7efe6] hover:text-[#2f241d] data-[active=true]:bg-[#efe0d0] data-[active=true]:text-[#5c4332] dark:text-white/78 dark:data-[active=true]:bg-white/10 dark:data-[active=true]:text-white dark:hover:bg-white/6 dark:hover:text-white"
                            isActive={
                              "url" in nav && (nav as any).url
                                ? isActiveUrl((nav as any).url)
                                : false
                            }
                            size="sm"
                            tooltip={nav.title}
                          >
                            {"url" in nav && (nav as any).url ? (
                              <Link to={(nav as any).url}>
                                {"icon" in nav && (nav as any).icon ? (
                                  <div className="flex size-7 items-center justify-center rounded-xl bg-[#f2e5d8] text-[#8b6242] dark:bg-white/8 dark:text-[#e2bc96]">
                                    <Icon
                                      className="size-4"
                                      icon={(nav as any).icon}
                                    />
                                  </div>
                                ) : null}
                                <span className="text-sm">{nav.title}</span>
                              </Link>
                            ) : (
                              <>
                                {"icon" in nav && (nav as any).icon ? (
                                  <div className="flex size-7 items-center justify-center rounded-xl bg-[#f2e5d8] text-[#8b6242] dark:bg-white/8 dark:text-[#e2bc96]">
                                    <Icon
                                      className="size-4"
                                      icon={(nav as any).icon}
                                    />
                                  </div>
                                ) : null}
                                <span className="text-sm">{nav.title}</span>
                              </>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                );
              })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
