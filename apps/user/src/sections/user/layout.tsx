"use client";
import { Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import Announcement from "@/sections/user/announcement";
import { SidebarLeft } from "./sidebar-left";
import { SidebarRight } from "./sidebar-right";

export default function UserLayout() {
  return (
    <SidebarProvider className="relative mx-auto min-h-svh w-full max-w-[1660px] gap-6 px-3 pb-10 pt-6 md:px-6 xl:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(214,167,122,0.08),transparent_60%)]" />
      <SidebarLeft className="sticky top-8 hidden h-fit w-56 bg-transparent p-0 shadow-none lg:flex" />
      <SidebarInset className="relative min-h-[calc(100svh-4rem)] rounded-[28px] border border-border/50 bg-background/78 p-4 shadow-[0_24px_72px_-56px_rgba(76,54,38,0.24)] backdrop-blur-xl md:p-6">
        <Outlet />
      </SidebarInset>
      <SidebarRight className="sticky top-8 hidden h-fit w-56 bg-transparent p-0 shadow-none 2xl:flex" />
      <Announcement type="popup" />
    </SidebarProvider>
  );
}
