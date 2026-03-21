import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global";
import { GlobalMap } from "./global-map";
import { Hero } from "./hero";
import { ProductShowcase } from "./product-showcase";
import { Stats } from "./stats";

export default function Main() {
  const { user } = useGlobalStore();
  const navigate = useNavigate();

  const showLanding = import.meta.env.VITE_SHOW_LANDING_PAGE !== "false";

  useEffect(() => {
    if (user) {
      navigate({ to: "/dashboard" });
      return;
    }

    if (!showLanding) {
      navigate({ to: "/auth" });
    }
  }, [user, navigate, showLanding]);

  if (!showLanding) return null;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,rgba(25,193,196,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(244,198,122,0.18),transparent_30%)]" />
      <div className="container relative space-y-16 pb-16">
        <Hero />
        <Stats />
        <ProductShowcase />
        <GlobalMap />
      </div>
    </main>
  );
}
