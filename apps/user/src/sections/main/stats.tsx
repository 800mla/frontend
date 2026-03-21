import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export function Stats() {
  const { t } = useTranslation("main");

  const list = [
    {
      name: t("users", "Users"),
      description: t("users_description", "Trusted by users worldwide"),
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/users.json"
        />
      ),
    },
    {
      name: t("servers", "Servers"),
      description: t(
        "servers_description",
        "High-performance servers globally"
      ),
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/servers.json"
        />
      ),
    },
    {
      name: t("locations", "Locations"),
      description: t("locations_description", "Available in multiple regions"),
      icon: (
        <DotLottieReact
          autoplay
          className="size-24"
          loop
          src="./assets/lotties/locations.json"
        />
      ),
    },
  ];
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 overflow-hidden rounded-[2rem] border border-border/70 bg-background/75 shadow-[0_24px_80px_rgba(18,20,23,0.08)] backdrop-blur-md"
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.8 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      <div className="grid w-full grid-cols-1 divide-y divide-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {list.map((item, index) => (
          <motion.div
            className="mx-auto flex w-full items-center justify-start px-6 py-6 sm:justify-center sm:px-5 sm:py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            key={item.name}
            transition={{ duration: 0.8, delay: index * 0.3, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border/60 bg-linear-to-br from-background to-secondary/70 shadow-sm">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <p className="font-semibold text-lg tracking-tight">
                  {item.name}
                </p>
                <p className="max-w-[14rem] text-muted-foreground text-sm leading-6">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
