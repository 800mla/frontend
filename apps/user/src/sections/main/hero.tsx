import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Link } from "@tanstack/react-router";
import { HoverBorderGradient } from "@workspace/ui/components/hover-border-gradient";
import { TextGenerateEffect } from "@workspace/ui/components/text-generate-effect";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BRAND_NAME, BRAND_TAGLINE } from "@/config/index";
import { useGlobalStore } from "@/stores/global";

export function Hero() {
  const { t } = useTranslation("main");
  const { common, user } = useGlobalStore();
  const { site } = common;
  const siteName = site.site_name || BRAND_NAME;
  const description = site.site_desc || BRAND_TAGLINE;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-10 pt-10 lg:min-h-[34rem] lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
      initial={{ opacity: 0, y: -50 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-center"
        initial={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.3 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="rounded-full border border-primary/20 bg-background/80 px-4 py-1 text-[11px] font-semibold tracking-[0.24em] text-primary uppercase shadow-sm backdrop-blur-sm">
          BINGKA ACCESS LAYER
        </div>
        <h1 className="my-6 max-w-3xl font-bold text-4xl leading-tight tracking-tight lg:text-6xl">
          {t("welcome", "Welcome to")}{" "}
          <span className="bg-linear-to-r from-primary via-cyan-500 to-amber-500 bg-clip-text text-transparent">
            {siteName}
          </span>
        </h1>
        <p className="max-w-xl text-base text-muted-foreground leading-7 sm:text-lg">
          {description}
        </p>
        {description && (
          <TextGenerateEffect
            className="mb-8 mt-3 max-w-xl *:text-muted-foreground"
            words={description}
          />
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Link to={user ? "/dashboard" : "/auth"}>
            <HoverBorderGradient
              as="button"
              className="m-0.5 flex items-center space-x-2 text-white"
              containerClassName="rounded-full"
            >
              {t("started", "Get Started")}
            </HoverBorderGradient>
          </Link>
          <HoverBorderGradient
            as="div"
            className="m-0.5"
            containerClassName="rounded-full bg-transparent"
          >
            <Link
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "rounded-full border border-border/60 bg-background/70 px-5 backdrop-blur-sm"
              )}
              to="/auth"
            >
              {user ? "Open panel" : "Member sign in"}
            </Link>
          </HoverBorderGradient>
        </div>
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full"
        initial={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.5 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/50 bg-white/60 p-4 shadow-[0_30px_80px_rgba(18,20,23,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.22em] text-primary uppercase">
                Live portal
              </p>
              <p className="mt-1 font-semibold text-lg">{siteName}</p>
            </div>
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Stable route
            </div>
          </div>
          <div className="rounded-[1.5rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 p-3">
            <DotLottieReact
              autoplay
              loop
              src="./assets/lotties/network-security.json"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
