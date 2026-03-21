import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function GlobalMap() {
  const { t } = useTranslation("main");
  return (
    <motion.section
      className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-background/70 p-6 shadow-[0_24px_80px_rgba(18,20,23,0.08)] backdrop-blur-md sm:p-8"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-background/80 px-4 py-1 font-semibold text-[11px] text-primary uppercase tracking-[0.24em] shadow-sm backdrop-blur-sm">
        Coverage view
      </div>
      <motion.h2
        className="mb-2 text-center font-bold text-3xl tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t("global_map_itle", "Reach further with a calmer global footprint")}
      </motion.h2>
      <motion.p
        className="mx-auto mb-8 max-w-3xl text-center text-lg text-muted-foreground leading-8"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t(
          "global_map_description",
          "See the broader route surface at a glance, compare regions faster, and move into the right destination without friction."
        )}
      </motion.p>
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="aspect-video w-full overflow-hidden rounded-[1.5rem] border border-border/60 bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950"
        initial={{ scale: 0.9, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.4,
        }}
      >
        <DotLottieReact
          autoplay
          className="w-full scale-150"
          loop
          src="./assets/lotties/global-map.json"
        />
      </motion.div>
    </motion.section>
  );
}
