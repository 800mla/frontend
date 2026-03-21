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
    <SidebarProvider className="relative mx-auto min-h-svh w-full max-w-[1700px] gap-4 px-3 pb-10 pt-6 md:px-6 xl:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(214,167,122,0.12),transparent_60%)]" />
      <SidebarLeft className="sticky top-6 hidden h-[calc(100svh-3rem)] w-64 rounded-[28px] border border-border/60 bg-card/58 p-3 shadow-[0_24px_80px_-56px_rgba(76,54,38,0.5)] backdrop-blur-xl lg:flex" />
      <SidebarInset className="relative min-h-[calc(100svh-3rem)] rounded-[32px] border border-border/60 bg-background/78 p-4 shadow-[0_32px_90px_-60px_rgba(76,54,38,0.42)] backdrop-blur-xl md:p-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
        <Outlet />
      </SidebarInset>
      <SidebarRight className="sticky top-6 hidden h-[calc(100svh-3rem)] w-60 rounded-[28px] border border-border/60 bg-card/58 p-2 shadow-[0_24px_80px_-56px_rgba(76,54,38,0.5)] backdrop-blur-xl 2xl:flex" />
      <Announcement type="popup" />
    </SidebarProvider>
  );
}
