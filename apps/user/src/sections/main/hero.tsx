import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BRAND_TAGLINE } from "@/config/index";
import { useGlobalStore } from "@/stores/global";

export function Hero() {
  const { common, user } = useGlobalStore();
  const { site } = common;
  const description = site.site_desc || BRAND_TAGLINE;

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-[10%] top-[15%] h-[350px] w-[350px] rounded-full opacity-20 blur-[80px]"
          style={{ background: "hsl(27 29.3% 32.5%)" }}
        />
        <div
          className="absolute bottom-[15%] left-[15%] h-[280px] w-[280px] rounded-full opacity-15 blur-[80px]"
          style={{ background: "hsl(27 53.5% 65.9%)" }}
        />
        <div
          className="absolute right-[35%] top-[40%] h-[180px] w-[180px] rounded-full opacity-10 blur-[60px]"
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
          <span className="text-xs font-bold uppercase tracking-[3px] text-primary">
            Premium Cloud Network
          </span>
        </motion.div>

        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-4xl font-bold leading-tight lg:text-6xl"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          像<span className="text-accent italic">深夜冷萃</span>一样
          <br />
          丝滑的网络体验。
        </motion.h1>

        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground"
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
          <Link
            className="inline-block rounded bg-primary px-8 py-4 text-sm font-medium uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
            to={user ? "/dashboard" : "/purchasing"}
          >
            查看菜单
          </Link>
          <a
            className="inline-block rounded border border-secondary px-8 py-4 text-sm font-medium uppercase tracking-wider text-foreground transition-all hover:border-primary hover:text-primary"
            href="#features"
          >
            品鉴我们的哲学
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
