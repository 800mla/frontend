import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import Empty from "@workspace/ui/composed/empty";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { getSubscription } from "@workspace/ui/services/user/portal";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import Content from "./content";

type SubscribeFeature = {
  icon?: string;
  label: string;
  type: "default" | "success" | "destructive";
};

export default function Purchasing() {
  const navigate = useNavigate();
  const { id } = useSearch({ strict: false }) as { id?: string };
  const { t, i18n } = useTranslation("subscribe");
  const [selectedId, setSelectedId] = useState<number | undefined>(
    id ? Number(id) : undefined
  );

  const { data } = useQuery({
    queryKey: ["subscription", i18n.language],
    queryFn: async () => {
      const { data } = await getSubscription(
        {
          language: i18n.language,
        },
        {
          skipErrorHandler: true,
        }
      );
      return data.data?.list || [];
    },
  });

  const filteredData = useMemo(
    () => data?.filter((item: API.Subscribe) => item.show) || [],
    [data]
  );

  const activeId = id ? Number(id) : selectedId;
  const subscription = filteredData.find(
    (item: API.Subscribe) => item.id === activeId
  );

  useEffect(() => {
    if (filteredData.length === 0) return;
    if (activeId) return;

    const firstVisible = filteredData[0];
    if (!firstVisible) return;

    setSelectedId(firstVisible.id);
    navigate({
      search: { id: String(firstVisible.id) },
      to: "/purchasing",
    });
  }, [activeId, filteredData, navigate]);

  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };

  const selectSubscription = async (itemId: number) => {
    setSelectedId(itemId);
    await navigate({
      search: { id: String(itemId) },
      to: "/purchasing",
    });
  };

  return (
    <main className="container space-y-10 pb-16">
      <section className="overflow-hidden rounded-[34px] border border-[#eadfd3] bg-[linear-gradient(135deg,#fff8f2_0%,#f6eee6_48%,#f2e4d6_100%)] shadow-[0_28px_70px_-52px_rgba(121,93,67,0.24)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#352720,#433026_48%,#52392c_100%)]">
        <div className="grid gap-8 px-7 py-8 lg:px-9 lg:py-10 xl:grid-cols-[minmax(0,1.1fr)_420px] xl:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dcc9b7] bg-white/80 px-3 py-1 text-[#8d6748] text-xs uppercase tracking-[0.16em] dark:border-white/10 dark:bg-white/8 dark:text-[#e2bc96]">
              <Icon className="size-4" icon="uil:shopping-bag" />
              Guest Purchase
            </div>
            <div className="space-y-3">
              <h1 className="font-semibold text-[#2f241d] text-[2rem] tracking-tight lg:text-[2.45rem] dark:text-white">
                {t("guestPurchaseTitle", "购买套餐")}
              </h1>
              <p className="max-w-2xl text-[#766558] text-[0.98rem] leading-7 dark:text-white/65">
                {t(
                  "guestPurchaseDescription",
                  "先选择适合你的套餐，再创建账户并直接完成支付。整个流程保持匿名购买场景的清晰感，不堆无关信息。"
                )}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <HeroPill
                icon="uil:layer-group"
                label="可选套餐"
                value={`${filteredData.length} 项`}
              />
              <HeroPill
                icon="uil:bolt-alt"
                label="购买流程"
                value="选套餐 / 填邮箱 / 完成支付"
              />
              <HeroPill
                icon="uil:shield-check"
                label="交付方式"
                value="支付成功后自动生成订阅"
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-[#eadccf] bg-white/78 p-5 shadow-[0_18px_52px_-40px_rgba(121,93,67,0.18)] backdrop-blur dark:border-white/10 dark:bg-white/6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[#9b8a7b] text-xs uppercase tracking-[0.16em] dark:text-white/40">
                  Current Selection
                </div>
                <div className="mt-2 font-semibold text-[#2f241d] text-xl dark:text-white">
                  {subscription?.name || t("choosePlanFirst", "请先选择套餐")}
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f8efe6] text-[#8f6442] dark:bg-white/8 dark:text-[#e2bc96]">
                <Icon className="size-6" icon="uil:box" />
              </div>
            </div>

            {subscription ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                      <Display
                        type="currency"
                        value={subscription.unit_price}
                      />
                    </div>
                    <div className="text-[#7d6b5e] text-sm dark:text-white/60">
                      /
                      {unitTimeMap[subscription.unit_time || "Month"] ||
                        subscription.unit_time}
                    </div>
                  </div>
                  <div className="rounded-full border border-[#e8d7c7] bg-[#fffaf5] px-3 py-1 text-[#8d6748] text-xs dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]">
                    ID #{subscription.id}
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetricBadge
                    label="流量"
                    value={
                      <Display
                        type="traffic"
                        unlimited
                        value={subscription.traffic}
                      />
                    }
                  />
                  <MetricBadge
                    label="速率"
                    value={
                      <Display
                        type="trafficSpeed"
                        unlimited
                        value={subscription.speed_limit}
                      />
                    }
                  />
                  <MetricBadge
                    label="设备"
                    value={
                      <Display
                        type="number"
                        unlimited
                        value={subscription.device_limit}
                      />
                    }
                  />
                </div>
              </div>
            ) : (
              <p className="mt-5 text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                先从下方选择一个套餐，右侧订单摘要会自动切换到当前套餐。
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <StepHeader index="01" title={t("choosePlan", "选择套餐")} />
            <p className="max-w-2xl text-[#7a695c] text-sm leading-7 dark:text-white/60">
              根据你的使用频率、设备数量和带宽需求完成选择。选中后，下方购买区域会自动同步。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MiniPill label="匿名购买" value="无需先登录" />
            <MiniPill label="订阅交付" value="支付成功后自动生成" />
            <MiniPill label="订单同步" value="右侧摘要实时更新" />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredData.map((item, index) => {
            const parsedDescription = parseSubscribeDescription(
              item.description
            );
            const selected = item.id === activeId;

            return (
              <Card
                className={cn(
                  "group hover:-translate-y-1 relative overflow-hidden rounded-[30px] border border-[#efe5db] bg-white shadow-[0_24px_64px_-48px_rgba(121,93,67,0.18)] transition-all duration-300 hover:shadow-[0_34px_78px_-52px_rgba(121,93,67,0.22)] dark:border-white/10 dark:bg-[#171412]",
                  selected &&
                    "border-[#d8bfaa] shadow-[0_30px_80px_-52px_rgba(145,102,68,0.32)]"
                )}
                key={item.id}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(248,238,227,0.95),rgba(255,255,255,0))] dark:bg-[linear-gradient(180deg,rgba(111,78,55,0.2),rgba(23,20,18,0))]" />
                <CardHeader className="relative space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center rounded-full border border-[#e5d4c4] bg-[#fffaf5] px-3 py-1 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]">
                        {selected
                          ? t("selected", "已选择")
                          : index === 0
                            ? "Starter"
                            : index === 1
                              ? "Recommend"
                              : "Plan"}
                      </div>
                      <div className="font-semibold text-[#2f241d] text-[1.45rem] tracking-tight dark:text-white">
                        {item.name}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl border border-[#eadfd3] bg-white/80 text-[#8f6442] dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]",
                        selected &&
                          "border-[#d0b59d] bg-[#f7efe7] text-[#7a5538] dark:bg-white/10"
                      )}
                    >
                      <Icon
                        className="size-5"
                        icon={selected ? "uil:check-circle" : "uil:box"}
                      />
                    </div>
                  </div>

                  <p className="min-h-[48px] text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                    {parsedDescription.description ||
                      "适合稳定使用场景，支付成功后可直接生成订阅信息与客户端导入配置。"}
                  </p>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricBadge
                      label="流量"
                      value={
                        <Display
                          type="traffic"
                          unlimited
                          value={item.traffic}
                        />
                      }
                    />
                    <MetricBadge
                      label="速率"
                      value={
                        <Display
                          type="trafficSpeed"
                          unlimited
                          value={item.speed_limit}
                        />
                      }
                    />
                    <MetricBadge
                      label="设备"
                      value={
                        <Display
                          type="number"
                          unlimited
                          value={item.device_limit}
                        />
                      }
                    />
                  </div>
                </CardHeader>

                <CardContent className="relative flex h-full flex-col gap-5 px-6 pb-5">
                  <ul className="space-y-3 text-sm">
                    {parsedDescription.features.length > 0 ? (
                      parsedDescription.features
                        .slice(0, 4)
                        .map(
                          (feature: SubscribeFeature, featureIndex: number) => (
                            <li
                              className={cn(
                                "flex items-start gap-2 text-[#5f5146] leading-6 dark:text-white/70",
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
                      <li className="text-[#7d6b5e] leading-7 dark:text-white/60">
                        当前套餐暂无额外说明，可直接选择后在下方继续完成购买。
                      </li>
                    )}
                  </ul>

                  <div className="rounded-[24px] border border-[#efe4d8] bg-[#fcf8f3] p-4 dark:border-white/10 dark:bg-white/5">
                    <SubscribeDetail
                      subscribe={{
                        ...item,
                        name: undefined,
                      }}
                    />
                  </div>
                </CardContent>

                <Separator className="bg-[#efe5db] dark:bg-white/10" />

                <CardFooter className="flex items-end justify-between gap-4 p-6 pt-5">
                  <div>
                    <h2 className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                      <Display type="currency" value={item.unit_price} />
                    </h2>
                    <div className="text-[#7d6b5e] text-sm dark:text-white/60">
                      /
                      {unitTimeMap[item.unit_time || "Month"] || item.unit_time}
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "rounded-2xl px-6",
                      selected
                        ? "bg-[#6f4e37] text-white hover:bg-[#5d4330]"
                        : "bg-[#f6ebe0] text-[#6f4e37] hover:bg-[#eedfce] dark:bg-white/8 dark:text-white"
                    )}
                    onClick={() => selectSubscription(item.id)}
                  >
                    {selected
                      ? t("selected", "已选择")
                      : t("choosePlan", "选择套餐")}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredData.length === 0 && <Empty />}
      </section>

      {subscription ? (
        <Content subscription={subscription} />
      ) : (
        <div className="rounded-[28px] border border-border/55 bg-background/70 p-8 text-center text-muted-foreground">
          {t("choosePlanFirst", "请先选择一个套餐，再继续完成购买。")}
        </div>
      )}
    </main>
  );
}

function StepHeader({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-full bg-[#63baa9] font-semibold text-sm text-white shadow-[0_12px_24px_-16px_rgba(99,186,169,0.7)]">
        {index}
      </div>
      <h2 className="font-semibold text-[#2f241d] text-[1.55rem] tracking-tight dark:text-white">
        {title}
      </h2>
    </div>
  );
}

function HeroPill({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadfd3] bg-white/82 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/6">
      <div className="flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:text-[#e2bc96]">
        <Icon className="size-4" icon={icon} />
        {label}
      </div>
      <div className="mt-2 font-medium text-[#2f241d] text-sm dark:text-white">
        {value}
      </div>
    </div>
  );
}

function MiniPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-[#e6d7c8] bg-[#fffaf5] px-3 py-1 text-[#7d6b5e] text-xs dark:border-white/10 dark:bg-white/6 dark:text-white/60">
      {label} · {value}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-[#eee3d8] bg-white/72 px-4 py-3 dark:border-white/10 dark:bg-white/6">
      <div className="text-[#9b8b7d] text-[11px] uppercase tracking-[0.14em] dark:text-white/40">
        {label}
      </div>
      <div className="mt-1 font-medium text-[#2f241d] text-sm dark:text-white">
        {value}
      </div>
    </div>
  );
}

function parseSubscribeDescription(description: string) {
  try {
    const parsed = JSON.parse(description);
    return {
      description: parsed.description || "",
      features: Array.isArray(parsed.features)
        ? (parsed.features as SubscribeFeature[])
        : [],
    };
  } catch {
    return {
      description: "",
      features: [] as SubscribeFeature[],
    };
  }
}
