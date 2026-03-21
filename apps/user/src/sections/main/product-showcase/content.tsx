import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";
import type { Key, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import { useGlobalStore } from "@/stores/global";

interface ProductShowcaseProps {
  subscriptionData: API.Subscribe[];
}

export function Content({ subscriptionData }: ProductShowcaseProps) {
  const { t } = useTranslation("main");
  const { user } = useGlobalStore();

  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  return (
    <motion.section
      className="relative"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1 }}
    >
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex rounded-full border border-primary/20 bg-background/80 px-4 py-1 font-semibold text-[11px] text-primary uppercase tracking-[0.24em] shadow-sm backdrop-blur-sm">
          Curated plans
        </div>
      </div>
      <motion.h2
        className="mb-2 text-center font-bold text-3xl tracking-tight sm:text-4xl"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t("product_showcase_title", "Choose a plan that fits your pace")}
      </motion.h2>
      <motion.p
        className="mx-auto mb-8 max-w-2xl text-center text-lg text-muted-foreground leading-8"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        {t(
          "product_showcase_description",
          "Compare the essentials quickly, then move into the panel with the right balance of speed, coverage, and cost."
        )}
      </motion.p>
      <div className="mx-auto flex flex-wrap justify-center gap-8 overflow-x-auto overflow-y-hidden *:max-w-80 *:flex-auto">
        {subscriptionData?.map((item, index) => (
          <motion.div
            className="w-1/2 lg:w-1/4"
            initial={{ opacity: 0, y: 50 }}
            key={item.id}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.5 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <Card className="hover:-translate-y-1 flex h-full flex-col gap-0 overflow-hidden rounded-[1.5rem] border border-border/70 bg-background/80 py-0 shadow-[0_18px_60px_rgba(18,20,23,0.08)] transition-all duration-300 hover:shadow-[0_24px_80px_rgba(18,20,23,0.12)]">
              <CardHeader className="bg-linear-to-r from-secondary/80 to-background p-5 font-medium text-xl">
                <div className="flex items-center justify-between gap-3">
                  <span>{item.name}</span>
                  <span className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1 font-semibold text-[10px] text-primary uppercase tracking-[0.2em]">
                    Recommended
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-grow flex-col gap-4 p-6 text-sm">
                <ul className="flex flex-grow flex-col gap-3">
                  {(() => {
                    let parsedDescription: {
                      description: string;
                      features: Array<{
                        icon: string;
                        label: ReactNode;
                        type: "default" | "success" | "destructive";
                      }>;
                    };
                    try {
                      parsedDescription = JSON.parse(item.description);
                    } catch {
                      parsedDescription = { description: "", features: [] };
                    }

                    const { description, features } = parsedDescription;
                    return (
                      <>
                        {description && (
                          <li className="text-muted-foreground">
                            {description}
                          </li>
                        )}
                        {features?.map(
                          (
                            feature: {
                              type: string;
                              icon: string;
                              label: ReactNode;
                            },
                            index: Key
                          ) => (
                            <li
                              className={cn("flex items-center gap-2", {
                                "text-muted-foreground line-through":
                                  feature.type === "destructive",
                              })}
                              key={index}
                            >
                              {feature.icon && (
                                <Icon
                                  className={cn("size-5 text-primary", {
                                    "text-green-500":
                                      feature.type === "success",
                                    "text-destructive":
                                      feature.type === "destructive",
                                  })}
                                  icon={feature.icon}
                                />
                              )}
                              {feature.label}
                            </li>
                          )
                        )}
                      </>
                    );
                  })()}
                </ul>
                <SubscribeDetail
                  subscribe={{
                    ...item,
                    name: undefined,
                  }}
                />
              </CardContent>
              <Separator />
              <CardFooter className="relative flex flex-col gap-4 p-4">
                {(() => {
                  const hasDiscount = item.discount && item.discount.length > 0;
                  const shouldShowOriginal = item.show_original_price !== false;

                  const displayPrice =
                    shouldShowOriginal || !hasDiscount
                      ? item.unit_price
                      : Math.round(
                          item.unit_price *
                            (item.discount?.[0]?.quantity ?? 1) *
                            ((item.discount?.[0]?.discount ?? 100) / 100)
                        );

                  const displayQuantity =
                    shouldShowOriginal || !hasDiscount
                      ? 1
                      : (item.discount?.[0]?.quantity ?? 1);

                  const unitTime =
                    unitTimeMap[item.unit_time!] ||
                    t(item.unit_time || "Month", item.unit_time || "Month");

                  return (
                    <motion.h2
                      animate={{ opacity: 1 }}
                      className="pb-4 font-semibold text-2xl tracking-tight sm:text-3xl"
                      initial={{ opacity: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Display type="currency" value={displayPrice} />
                      <span className="font-medium text-base">
                        {displayQuantity === 1
                          ? `/${unitTime}`
                          : `/${displayQuantity} ${unitTime}`}
                      </span>
                    </motion.h2>
                  );
                })()}
                <motion.div>
                  <Button
                    asChild
                    className="absolute bottom-0 left-0 w-full rounded-t-none rounded-b-[1.25rem]"
                  >
                    <Link
                      search={user ? undefined : { id: item.id }}
                      to={user ? "/subscribe" : "/purchasing"}
                    >
                      {t("subscribe", "Subscribe")}
                    </Link>
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
