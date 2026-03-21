"use client";

import { useLocation, useNavigate } from "@tanstack/react-router";

const LANDING_SCROLL_KEY = "bingka-landing-scroll-target";

function smoothScrollToSection(targetId: string, retries = 20) {
  const element = document.getElementById(targetId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    return;
  }

  if (retries > 0) {
    window.setTimeout(() => smoothScrollToSection(targetId, retries - 1), 80);
  }
}

export function consumeLandingScrollTarget() {
  if (typeof window === "undefined") return;

  const targetId = window.sessionStorage.getItem(LANDING_SCROLL_KEY);
  if (!targetId) return;

  window.sessionStorage.removeItem(LANDING_SCROLL_KEY);
  smoothScrollToSection(targetId);
}

export function useLandingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return async (targetId: string) => {
    if (typeof window === "undefined") return;

    if (location.pathname !== "/") {
      window.sessionStorage.setItem(LANDING_SCROLL_KEY, targetId);
      await navigate({ to: "/" });
      return;
    }

    smoothScrollToSection(targetId);
  };
}
