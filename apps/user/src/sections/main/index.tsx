import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { consumeLandingScrollTarget } from "@/hooks/use-landing-navigation";
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

  useEffect(() => {
    consumeLandingScrollTarget();
  }, []);

  if (!showLanding) return null;

  return (
    <main className="container space-y-16">
      <div className="space-y-16 pb-16">
        <Hero />
        <Stats />
        <ProductShowcase />
        <GlobalMap />
      </div>
    </main>
  );
}
