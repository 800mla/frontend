import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";

export function Stats() {
  const list = [
    {
      name: "BGP 精准拼配",
      description:
        "通过多线 BGP 动态路由调度，我们实时融合全球最优线路。犹如咖啡师调配豆子，找到速度与稳定性的完美平衡点。",
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/users.json"
        />
      ),
      accent: false,
    },
    {
      name: "冰滴级传输",
      description:
        "专为极客定制的传输协议。跨国 IPLC 专线能够无视拥堵环境，以超低延迟输送数据，带来 0丢包 的透心凉体验。",
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/servers.json"
        />
      ),
      accent: true,
    },
    {
      name: "无痕杯套加密",
      description:
        "采用业界顶级的 AES-256 套接字层加密，您的网络踪迹被完美伪装。我们绝不记录任何访问日志，保护您的数字隐私。",
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/locations.json"
        />
      ),
      accent: false,
    },
  ];
  return (
    <section className="border-y border-secondary/20 py-20" id="features">
      <div className="container">
        <div className="mb-16 text-center">
          <motion.div
            className="mb-4 inline-flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <span className="h-px w-10 bg-primary" />
            <span className="text-xs font-bold uppercase tracking-[3px] text-primary">
              Craftsmanship
            </span>
            <span className="h-px w-10 bg-primary" />
          </motion.div>
          <motion.h2
            className="mb-4 text-3xl font-bold text-primary lg:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            精心烘焙的基础设施
          </motion.h2>
          <motion.p
            className="mx-auto max-w-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            我们对待网络连接，就像对待一杯手工咖啡一样严苛。从链路提取到最终送达，每一个环节都经过精确计算。
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
        {list.map((item, index) => (
          <motion.div
            className="group relative overflow-hidden rounded-lg border border-primary/10 bg-card p-10 transition-all duration-300 hover:-translate-y-2.5 hover:border-primary/30 hover:shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            key={item.name}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="absolute left-0 top-0 h-0.5 w-full origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            <div className={`mb-5 text-4xl ${item.accent ? "text-accent" : "text-primary"}`}>
              {item.icon}
            </div>
            <h3 className="mb-3 text-xl font-semibold">{item.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}
