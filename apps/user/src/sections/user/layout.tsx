"use client";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { getCookie } from "@workspace/ui/lib/cookies";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import Announcement from "@/sections/user/announcement";
import { useGlobalStore } from "@/stores/global";

export default function UserLayout() {
  const navigate = useNavigate();
  const { t } = useTranslation("components");
  const { user } = useGlobalStore();
  const hasAuthorization = !!getCookie("Authorization");

  useEffect(() => {
    if (!hasAuthorization) {
      toast.info(t("header.loginRequired", "请先登录后再继续"));
      navigate({ to: "/auth" });
    }
  }, [hasAuthorization, navigate, t]);

  if (!(hasAuthorization || user)) return null;

  return (
    <div className="relative min-h-svh bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(251,249,246,0.98))] dark:bg-[radial-gradient(circle_at_top,rgba(96,71,46,0.16),transparent_34%),linear-gradient(180deg,rgba(20,17,15,1),rgba(16,14,13,1))]">
      <div className="mx-auto min-h-[calc(100svh-5rem)] w-full max-w-[1380px] px-4 pt-8 pb-14 md:px-6 xl:px-8">
        <Outlet />
      </div>
      <Announcement type="popup" />
    </div>
  );
}
