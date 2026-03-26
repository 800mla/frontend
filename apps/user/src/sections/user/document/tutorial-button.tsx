"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { buttonVariants } from "@workspace/ui/components/button";
import { Markdown } from "@workspace/ui/composed/markdown";
import { useOutsideClick } from "@workspace/ui/hooks/use-outside-click";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/ui/utils/formatting";
import { AnimatePresence, motion } from "framer-motion";
import { type RefObject, useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getTutorial } from "@/sections/user/document/tutorial";
import { CloseIcon } from "./close-icon";

interface Item {
  path: string;
  title: string;
  updated_at?: string;
  icon?: string;
}
export function TutorialButton({ items }: { items: Item[] }) {
  const { t } = useTranslation("document");

  const [active, setActive] = useState<Item | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    enabled: !!(active as Item)?.path,
    queryKey: ["getTutorial", (active as Item)?.path],
    queryFn: async () => {
      const markdown = await getTutorial((active as Item)?.path);
      return markdown;
    },
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    if (active && typeof active === "object") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref as RefObject<HTMLDivElement>, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-10 h-full w-full bg-[rgba(20,16,12,0.52)] backdrop-blur-[3px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 z-[100] p-3 sm:p-5">
            <motion.button
              animate={{
                opacity: 1,
              }}
              className="fixed top-6 right-6 z-[120] inline-flex h-14 items-center gap-2 rounded-full border border-[#d6c1ad] bg-[rgba(255,250,245,0.98)] px-5 font-semibold text-[#4f392a] text-sm shadow-[0_24px_60px_-24px_rgba(63,41,20,0.35)] transition hover:scale-[1.02] hover:bg-white dark:border-[#4b3a2e] dark:bg-[rgba(24,20,18,0.96)] dark:text-[#f7e7d7]"
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              initial={{
                opacity: 0,
              }}
              key={`button-${active.title}-${id}`}
              onClick={() => setActive(null)}
              type="button"
            >
              <CloseIcon className="size-5" />
              <span>{t("close", "关闭")}</span>
            </motion.button>
            <motion.div
              className="mx-auto flex h-full w-full max-w-[1280px] flex-col overflow-hidden rounded-[34px] border border-[#ead9ca] bg-[linear-gradient(180deg,rgba(255,253,250,0.98),rgba(245,238,229,0.98))] shadow-[0_32px_120px_-36px_rgba(44,29,18,0.32)] dark:border-[#342923] dark:bg-[linear-gradient(180deg,rgba(24,20,18,0.99),rgba(18,15,14,0.99))]"
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
            >
              <div className="border-[#ead9ca] border-b bg-[linear-gradient(180deg,rgba(255,252,248,0.94),rgba(255,248,240,0.86))] px-6 py-6 pr-24 sm:px-8 sm:py-7 sm:pr-28 dark:border-[#342923] dark:bg-[linear-gradient(180deg,rgba(35,29,25,0.92),rgba(26,22,20,0.82))]">
                <div className="inline-flex items-center rounded-full border border-[#e2d1c2] bg-white/72 px-3 py-1 font-medium text-[#8b6d57] text-xs uppercase tracking-[0.16em] dark:border-[#4b3a2e] dark:bg-white/5 dark:text-[#c7a992]">
                  Tutorial
                </div>
                <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="font-semibold text-[#241a14] text-[1.9rem] tracking-tight sm:text-[2.3rem] dark:text-[#f7eee5]">
                      {active.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[#7b6758] text-[1rem] leading-7 dark:text-[#b4a093]">
                      直接跟着步骤完成配置。阅读区已经放大并拉开留白，便于边看边操作，不会再压缩在中间的小块区域里。
                    </p>
                  </div>
                  {active.updated_at && (
                    <div className="rounded-full border border-[#e8dbcf] bg-white/78 px-4 py-2 text-[#715d4f] text-sm dark:border-[#42342b] dark:bg-white/5 dark:text-[#bea797]">
                      更新于 {formatDate(new Date(active.updated_at), false)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,rgba(251,247,242,0.88),rgba(247,240,231,0.72))] px-4 py-4 sm:px-6 sm:py-6 dark:bg-[linear-gradient(180deg,rgba(21,18,16,0.88),rgba(17,14,13,0.72))]">
                <div className="mx-auto w-full max-w-[920px] rounded-[30px] border border-[#eee2d6] bg-white/92 px-5 py-6 shadow-[0_24px_70px_-50px_rgba(55,37,23,0.26)] sm:px-8 sm:py-8 dark:border-[#342923] dark:bg-[rgba(28,23,20,0.88)]">
                  <Markdown
                    components={{
                      img: ({ node, className, ...props }: any) => (
                        <img
                          {...props}
                          alt=""
                          className="my-6 block h-auto w-full rounded-[24px] border border-[#eadfd6] bg-transparent object-contain shadow-[0_16px_40px_rgba(78,54,37,0.1)] dark:border-[#3c2f28] dark:shadow-none"
                          height={384}
                          width={800}
                        />
                      ),
                    }}
                  >
                    {data?.content || ""}
                  </Markdown>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <div className="flex w-full flex-col gap-4">
        {items.map((item) => (
          <motion.div
            className="hover:-translate-y-1 flex cursor-pointer items-center justify-between rounded-[24px] border border-[#e8ddd1] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,239,0.92))] p-4 shadow-[0_18px_44px_-40px_rgba(53,35,23,0.18)] transition-all duration-300 hover:border-[#d8c2ae] hover:shadow-[0_24px_56px_-36px_rgba(53,35,23,0.22)] dark:border-[#342923] dark:bg-[linear-gradient(180deg,rgba(29,24,21,0.96),rgba(22,18,16,0.94))] dark:hover:border-[#4b3a2e]"
            key={`card-${item.title}-${id}`}
            layoutId={`card-${item.title}-${id}`}
            onClick={() => setActive(item)}
          >
            <div className="flex flex-row items-center gap-4">
              <motion.div layoutId={`image-${item.title}-${id}`}>
                <Avatar className="size-12">
                  <AvatarImage alt={item.title ?? ""} src={item.icon ?? ""} />
                  <AvatarFallback className="bg-primary/80 text-white">
                    {item.title.split("")[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <motion.h3
                  className="font-semibold text-[1.02rem] text-foreground"
                  layoutId={`title-${item.title}-${id}`}
                >
                  {item.title}
                </motion.h3>
                {item.updated_at && (
                  <motion.p
                    className="text-center text-neutral-600 md:text-left dark:text-neutral-400"
                    layoutId={`description-${item.title}-${id}`}
                  >
                    {formatDate(new Date(item.updated_at), false)}
                  </motion.p>
                )}
              </div>
            </div>
            <motion.button
              className={cn(
                buttonVariants({
                  variant: "secondary",
                }),
                "rounded-full border border-[#ddd0c2] bg-[#f7efe6] px-4 text-[#5b4331] shadow-none hover:bg-[#efe4d8] dark:border-[#44352c] dark:bg-[#2a211d] dark:text-[#f2dfcf] dark:hover:bg-[#332823]"
              )}
              layoutId={`button-${item.title}-${id}`}
            >
              {t("read", "打开阅读")}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </>
  );
}
