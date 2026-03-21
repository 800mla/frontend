import { motion } from "framer-motion";

export function Stats() {
  const list = [
    {
      name: "BGP 精准拼配",
      description:
        "通过多线 BGP 动态路由调度，我们实时筛选不同国家与运营商之间的最优路径。像精品拼配咖啡一样，我们不是单纯追求一项参数，而是精确平衡延迟、抖动、稳定性与持续可用性。",
      icon: "⚖️",
      accent: false,
    },
    {
      name: "冰滴级传输",
      description:
        "我们重视的不只是速度峰值，而是高峰时段依旧平顺的体验。通过更克制的链路策略与低波动调度能力，让跨境访问在复杂网络环境下依然保持冷静、细腻、连贯。",
      icon: "🧊",
      accent: true,
    },
    {
      name: "无痕杯套加密",
      description:
        "从传输链路到访问入口，我们尽可能减少外露特征与多余噪声。加密、隔离与最小暴露原则不是宣传语，而是 Bingka 作为长期服务必须遵守的基础礼仪。",
      icon: "🛡️",
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
            我们不把连接当作廉价流量转售，而把它视为一项需要审美、纪律与长期主义的服务工程。Bingka 的理念，是用更少的噪声、更稳的路径和更克制的体验，交付真正值得依赖的网络品质。
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
