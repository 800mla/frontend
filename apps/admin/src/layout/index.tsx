import { Outlet } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect, useState } from "react";
import { Header } from "@/layout/header";
import { SidebarLeft } from "./sidebar-left";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const sidebarState = getCookie("sidebar_state");
    if (sidebarState !== undefined) {
      setOpen(sidebarState === "true");
    }
  }, []);

  return (
    <SidebarProvider defaultOpen={open}>
      <SidebarLeft />
      <SidebarInset className="relative flex-grow overflow-hidden bg-[linear-gradient(180deg,#f7f1ea_0%,#f2e8dd_52%,#efe3d6_100%)] dark:bg-[linear-gradient(180deg,#181311_0%,#1f1815_52%,#241c18_100%)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-140px] right-[-110px] h-[320px] w-[320px] rounded-full bg-[#d8b89d]/16 blur-3xl dark:bg-[#a77a54]/14" />
          <div className="absolute bottom-[-180px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[#b9d7d4]/16 blur-3xl dark:bg-[#6aa39b]/12" />
        </div>
        <Header />
        <div className="relative h-[calc(100vh-56px)] flex-grow overflow-auto px-4 pt-4 pb-6 lg:px-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
