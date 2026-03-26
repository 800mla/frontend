"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { querySubscribeList } from "@workspace/ui/services/user/subscribe";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import Purchase from "./purchase";

export default function Subscribe() {
  const { t, i18n } = useTranslation("subscribe");
  const locale = i18n.language;
  const [subscribe, setSubscribe] = useState<API.Subscribe>();

  const { data } = useQuery({
    queryKey: ["querySubscribeList", locale],
    queryFn: async () => {
      const { data } = await querySubscribeList({ language: locale });
      return data.data?.list || [];
    },
  });

  const filteredData = useMemo(
    () => data?.filter((item) => item.show) || [],
    [data]
  );

  return (
    <>
      <div className="mx-auto max-w-[1320px] space-y-8">
        <section className="rounded-[34px] border border-[#eadfd3] bg-[linear-gradient(135deg,#fff6ec_0%,#f6e8da_45%,#f1dfcf_100%)] px-7 py-8 shadow-[0_24px_64px_-48px_rgba(121,93,67,0.2)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#3b2a22,#4a3328_45%,#553a2d_100%)]">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center rounded-full border border-[#dbc8b6] bg-white/80 px-3 py-1 text-[#8f6442] text-xs uppercase tracking-[0.16em]">
                Plans
              </div>
              <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                购买套餐
              </div>
              <p className="max-w-2xl text-[#766558] text-[1rem] leading-7 dark:text-white/65">
                页面走更简洁的消费型布局：先看套餐，再看差异，最后直接下单。这里不堆复杂信息，只保留真正影响购买判断的内容。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TopPill
                icon="uil:coffee"
                label="冰咖主题"
                value="暖米 / 咖棕 / 奶油白"
              />
              <TopPill
                icon="uil:shield-check"
                label="体验原则"
                value="简洁、稳定、易决策"
              />
              <TopPill
                icon="uil:box"
                label="可售套餐"
                value={`${filteredData.filter((item) => item.sell).length} 项`}
              />
            </div>
          </div>
        </section>

        {filteredData.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredData.map((item, index) => {
              const parsedDescription = parseSubscribeDescription(
                item.description
              );
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

              const unitTime = getUnitTimeLabel(item.unit_time, t);

              return (
                <Card
                  className={cn(
                    "group hover:-translate-y-1 relative overflow-hidden rounded-[30px] border border-[#efe5db] bg-white shadow-[0_26px_60px_-48px_rgba(121,93,67,0.18)] transition-all duration-300 hover:shadow-[0_34px_72px_-46px_rgba(121,93,67,0.22)] dark:border-white/10 dark:bg-[#171412]",
                    index === 1 &&
                      "border-[#d9c0a7] shadow-[0_30px_70px_-46px_rgba(155,108,68,0.26)]"
                  )}
                  key={item.id}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(245,235,223,0.92),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(111,78,55,0.16),rgba(23,20,18,0))]" />
                  <CardHeader className="relative space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="inline-flex items-center rounded-full border border-[#e8d5c3] bg-[#fffaf5] px-3 py-1 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/5 dark:text-[#e1b994]">
                          {index === 1
                            ? "Recommend"
                            : index === 0
                              ? "Popular"
                              : "Plan"}
                        </div>
                        <CardTitle className="text-[#2f241d] text-[1.45rem] tracking-tight dark:text-white">
                          {item.name}
                        </CardTitle>
                      </div>

                      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f8efe6] text-[#8f6442] shadow-sm dark:bg-white/5 dark:text-[#dfb78f]">
                        <Icon className="size-6" icon="uil:box" />
                      </div>
                    </div>

                    <CardDescription className="min-h-[48px] text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                      {parsedDescription.description ||
                        "适合日常稳定使用，购买后自动生成订阅链接与客户端导入入口。"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="relative flex h-full flex-col gap-6 px-6 pb-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoBadge
                        label="流量"
                        value={
                          item.traffic ? (
                            <Display type="traffic" value={item.traffic} />
                          ) : (
                            "按套餐为准"
                          )
                        }
                      />
                      <InfoBadge
                        label="速度"
                        value={
                          item.speed_limit
                            ? `${item.speed_limit} Mbps`
                            : "标准速率"
                        }
                      />
                    </div>

                    <ul className="space-y-3">
                      {parsedDescription.features.length > 0 ? (
                        parsedDescription.features
                          .slice(0, 5)
                          .map(
                            (
                              feature: SubscribeFeature,
                              featureIndex: number
                            ) => (
                              <li
                                className={cn(
                                  "flex items-start gap-2 text-[#5f5146] text-sm leading-6 dark:text-white/70",
                                  feature.type === "destructive" &&
                                    "line-through opacity-50"
                                )}
                                key={featureIndex}
                              >
                                <Icon
                                  className={cn(
                                    "mt-0.5 size-4 shrink-0 text-[#9b6c44]",
                                    feature.type === "success" &&
                                      "text-emerald-500",
                                    feature.type === "destructive" &&
                                      "text-destructive"
                                  )}
                                  icon={feature.icon || "uil:check"}
                                />
                                <span>{feature.label}</span>
                              </li>
                            )
                          )
                      ) : (
                        <li className="text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                          当前套餐暂无额外说明，可直接购买后查看完整订阅信息。
                        </li>
                      )}
                    </ul>

                    <div className="mt-auto rounded-[24px] border border-[#efe4d8] bg-[#fcf8f3] p-4 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                            <Display type="currency" value={displayPrice} />
                          </div>
                          <div className="text-[#7d6b5e] text-sm dark:text-white/60">
                            {displayQuantity === 1
                              ? `/${unitTime}`
                              : `/${displayQuantity} ${unitTime}`}
                          </div>
                        </div>

                        <Button
                          className="rounded-2xl bg-[#6f4e37] px-6 text-white hover:bg-[#5d4330]"
                          onClick={() => {
                            setSubscribe(item);
                          }}
                        >
                          {t("buy", "Buy")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>
        ) : (
          <Empty />
        )}
      </div>

      <Purchase setSubscribe={setSubscribe} subscribe={subscribe} />
    </>
  );
}

function TopPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadfd3] bg-white/85 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em]">
        <Icon className="size-4" icon={icon} />
        {label}
      </div>
      <div className="mt-2 font-medium text-[#2f241d] text-sm dark:text-white">
        {value}
      </div>
    </div>
  );
}

function InfoBadge({
  label,
  value,
}: {
  label: string;
  value: string | React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[#ede1d6] bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-[#9b8b7d] text-xs uppercase tracking-[0.14em]">
        {label}
      </div>
      <div className="mt-1 font-medium text-[#2f241d] text-sm dark:text-white">
        {value}
      </div>
    </div>
  );
}

function getUnitTimeLabel(
  value: string | undefined,
  t: (key: string, defaultValue: string) => string
) {
  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  return unitTimeMap[value || "Month"] || value || "Month";
}

function parseSubscribeDescription(description: string) {
  try {
    const parsed = JSON.parse(description);
    return {
      description: parsed.description || "",
      features: Array.isArray(parsed.features) ? parsed.features : [],
    };
  } catch {
    return {
      description,
      features: [],
    };
  }
}

type SubscribeFeature = {
  icon: string;
  label: string;
  type: "default" | "success" | "destructive";
};
