import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function GlobalMap() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-secondary/80 px-8 py-20 text-center md:px-16">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[400px] -translate-x-1/2 rounded-full opacity-30 blur-[100px]"
            style={{ background: "hsl(27 53.5% 65.9%)" }}
          />

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="mb-6 text-3xl font-bold text-white lg:text-5xl">
              准备好品尝极致网络了吗？
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-lg text-secondary-foreground/80">
              新用户注册可获得免费体验额度，零门槛感受 BINGKA 匠心调制的连接品质。
            </p>
            <Link
              className="inline-block rounded-md bg-primary px-10 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              to="/auth"
            >
              立即注册 · 免费品鉴
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
