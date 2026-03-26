import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BRAND_TAGLINE } from "@/config/index";
import { useLandingNavigation } from "@/hooks/use-landing-navigation";
import { useGlobalStore } from "@/stores/global";

export function Hero() {
  const { common, user } = useGlobalStore();
  const { site } = common;
  const description = site.site_desc || BRAND_TAGLINE;
  const navigateToLandingSection = useLandingNavigation();

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute top-[15%] right-[10%] h-[350px] w-[350px] rounded-full opacity-20 blur-[80px]"
          style={{ background: "hsl(27 29.3% 32.5%)" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] h-[280px] w-[280px] rounded-full opacity-15 blur-[80px]"
          style={{ background: "hsl(27 53.5% 65.9%)" }}
        />
        <div
          className="absolute top-[40%] right-[35%] h-[180px] w-[180px] rounded-full opacity-10 blur-[60px]"
          style={{ background: "hsl(198 72.7% 78.2%)" }}
        />
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-3xl"
        initial={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <span className="h-px w-10 bg-primary" />
          <span className="font-bold text-primary text-xs uppercase tracking-[3px]">
            Premium Cloud Network
          </span>
        </motion.div>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 font-bold text-4xl leading-tight lg:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          像<span className="text-accent italic">深夜冷萃</span>一样
          <br />
          丝滑的网络体验。
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-xl text-lg text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {description ||
            "BINGKA 采用企业级金融架构，为您提供纯净、无干扰的互联通道。没有繁杂的设置，只需一键注入，即可享受如精品咖啡般精心雕琢的极致连接。"}
        </motion.p>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-5"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {user ? (
            <Link
              className="inline-block rounded bg-primary px-8 py-4 font-medium text-primary-foreground text-sm uppercase tracking-wider shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              to="/dashboard"
            >
              查看菜单
            </Link>
          ) : (
            <button
              className="inline-block rounded bg-primary px-8 py-4 font-medium text-primary-foreground text-sm uppercase tracking-wider shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              onClick={() => navigateToLandingSection("menu")}
              type="button"
            >
              查看菜单
            </button>
          )}
          <button
            className="inline-block rounded border border-secondary px-8 py-4 font-medium text-foreground text-sm uppercase tracking-wider transition-all hover:border-primary hover:text-primary"
            onClick={() => navigateToLandingSection("features")}
            type="button"
          >
            品鉴我们的哲学
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
