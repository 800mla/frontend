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
    <main className="container space-y-12 pb-20">
      <section className="group relative overflow-hidden rounded-[32px] border border-[#e6d7c9] bg-[linear-gradient(135deg,#fffaf6_0%,#f8f0e7_54%,#fdf9f5_100%)] shadow-[0_26px_70px_-52px_rgba(111,78,55,0.28)] transition-all duration-500 hover:shadow-[0_34px_88px_-54px_rgba(111,78,55,0.34)] dark:border-[#4c3a2f] dark:bg-[linear-gradient(135deg,#261d18_0%,#1f1814_54%,#18120f_100%)]">
        <div className="-left-12 absolute top-0 h-48 w-48 rounded-full bg-[#f3dfcd]/70 blur-3xl transition-transform duration-700 group-hover:scale-110 dark:bg-[#6c4f3b]/28" />
        <div className="absolute right-[-3rem] bottom-[-3rem] h-56 w-56 rounded-full bg-[#d9c0ab]/40 blur-3xl transition-transform duration-700 group-hover:scale-110 dark:bg-[#8e6a4c]/18" />
        <div className="relative grid items-center gap-10 px-7 py-10 lg:px-10 lg:py-12 xl:grid-cols-[minmax(0,1.08fr)_380px]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dcc9b7] bg-white/80 px-3 py-1 text-[#8b6447] text-xs uppercase tracking-[0.16em] shadow-[0_10px_30px_-24px_rgba(111,78,55,0.4)] dark:border-[#5a4537] dark:bg-[#2b211b]/88 dark:text-[#f0ceb0]">
              <Icon className="size-4" icon="uil:shopping-bag" />
              Purchase Access
            </div>
            <div className="space-y-3">
              <h1 className="font-semibold text-[#2f241d] text-[2rem] tracking-tight lg:text-[2.7rem] dark:text-[#fff4ea]">
                冰咖风格的简洁购买流程，从选套餐到支付一步完成
              </h1>
              <p className="max-w-2xl text-[#6f6156] text-[0.98rem] leading-7 dark:text-[#cdb8a7]">
                覆盖主流视频站点、社交平台与 AI
                应用，支持多系统快速接入。先选择套餐，再创建账户并完成支付，页面会同步展示平台手续费和最终试算金额。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FlowPill index="01" text="选择套餐" />
              <FlowPill index="02" text="创建账户" />
              <FlowPill index="03" text="确认支付" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <HeroListItem text="解除对 YouTube、Google、Telegram、X 等站点的访问限制" />
              <HeroListItem text="iOS、macOS、Android、Windows、Linux 全面支持" />
              <HeroListItem text="支付成功后自动生成订阅，可直接在客户端导入使用" />
              <HeroListItem text="支付宝与微信通道手续费透明公示，实际金额实时试算" />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative flex aspect-square w-full max-w-[340px] items-center justify-center">
              <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.98),rgba(247,229,211,0.74)_34%,rgba(202,166,134,0.48)_64%,rgba(202,166,134,0.1)_100%)] blur-[2px] transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-[17%] rounded-full border border-white/70 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.98),rgba(249,239,231,0.72)_38%,rgba(180,140,106,0.14)_100%)] shadow-[0_30px_90px_-44px_rgba(111,78,55,0.3)] dark:border-[#7b5e49]/40 dark:bg-[radial-gradient(circle_at_30%_30%,rgba(92,68,52,0.62),rgba(58,42,32,0.4)_38%,rgba(25,18,15,0.05)_100%)] dark:shadow-[0_30px_90px_-44px_rgba(0,0,0,0.55)]" />
              <div className="absolute inset-[25%] rounded-full border border-white/70 bg-white/25 backdrop-blur-md dark:border-[#6a5140]/45 dark:bg-[#2d231c]/42" />
              <Icon
                className="relative z-10 size-28 text-[#9b6c44] transition-transform duration-700 group-hover:scale-105 dark:text-[#f0c9a4]"
                icon="uil:globe"
              />
              <FloatingChip
                className="top-[24%] left-[6%]"
                text="iOS / macOS"
              />
              <FloatingChip
                className="top-[18%] right-[4%]"
                text="AI / 社交 / 视频"
              />
              <FloatingChip
                className="right-[12%] bottom-[18%]"
                text="支付后自动开通"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <StepHeader index="01" title={t("choosePlan", "选择套餐")} />
            <p className="max-w-2xl text-[#7a695c] text-sm leading-7 dark:text-[#c7b3a2]">
              先根据你的使用频率和设备数量选择套餐。选中后，下面的账户创建、订单试算和支付区域会自动同步。
            </p>
          </div>
          <div className="rounded-full border border-[#e3d5c8] bg-[#fffaf6] px-4 py-2 text-[#7b6859] text-xs shadow-[0_10px_24px_-22px_rgba(111,78,55,0.35)] dark:border-[#4f3d31] dark:bg-[#241b16]/88 dark:text-[#cab6a4]">
            当前商品与手续费已接入真实接口，页面显示为本地临时预览效果
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredData.map((item, index) => {
            const parsedDescription = parseSubscribeDescription(
              item.description
            );
            const selected = item.id === activeId;

            return (
              <Card
                className={cn(
                  "group hover:-translate-y-1.5 relative overflow-hidden rounded-[26px] border border-[#eadfd4] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(252,247,242,0.98))] shadow-[0_22px_56px_-46px_rgba(111,78,55,0.18)] transition-all duration-300 hover:border-[#cfb49a] hover:shadow-[0_34px_70px_-48px_rgba(111,78,55,0.26)] dark:border-[#4e3c31] dark:bg-[linear-gradient(180deg,#241b17_0%,#1c1511_100%)] dark:hover:border-[#8f6b50] dark:hover:shadow-[0_34px_70px_-48px_rgba(0,0,0,0.55)]",
                  selected &&
                    "border-[#9b6c44] shadow-[0_34px_80px_-50px_rgba(111,78,55,0.28)]"
                )}
                key={item.id}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(241,224,207,0.55),rgba(255,255,255,0))] opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[linear-gradient(180deg,rgba(111,78,55,0.3),rgba(20,15,12,0))]" />
                <CardHeader className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center rounded-full border border-[#e1cfbf] bg-[#fff7ef] px-3 py-1 text-[#8b6447] text-xs uppercase tracking-[0.14em] dark:border-[#5c4738] dark:bg-[#2b211b]/88 dark:text-[#f0ceb0]">
                        {selected
                          ? t("selected", "已选择")
                          : index === 0
                            ? "Starter"
                            : index === 1
                              ? "Recommend"
                              : "Plan"}
                      </div>
                      <div className="font-semibold text-[#2f241d] text-[1.3rem] tracking-tight dark:text-[#fff3e8]">
                        {item.name}
                      </div>
                    </div>

                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-2xl border border-[#e8d8c9] bg-[#fff8f1] text-[#8f6442] transition-all duration-300 group-hover:scale-105 dark:border-[#5c4739] dark:bg-[#2e231c] dark:text-[#f0c9a4]",
                        selected &&
                          "border-[#b78960] bg-[#f5e9dd] text-[#7a5538] dark:bg-[#3a2b22]"
                      )}
                    >
                      <Icon
                        className="size-5"
                        icon={selected ? "uil:check-circle" : "uil:box"}
                      />
                    </div>
                  </div>

                  <p className="min-h-[40px] text-[#7d6b5e] text-sm leading-6 dark:text-[#c4af9d]">
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

                <CardContent className="flex h-full flex-col gap-5 px-6 pb-5">
                  <ul className="space-y-3 text-sm">
                    {parsedDescription.features.length > 0 ? (
                      parsedDescription.features
                        .slice(0, 4)
                        .map(
                          (feature: SubscribeFeature, featureIndex: number) => (
                            <li
                              className={cn(
                                "flex items-start gap-2 text-[#5f5146] leading-6 dark:text-[#d7c4b5]",
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
                      <li className="text-[#7d6b5e] leading-7 dark:text-[#c4af9d]">
                        当前套餐暂无额外说明，可直接选择后在下方继续完成购买。
                      </li>
                    )}
                  </ul>

                  <div className="rounded-[20px] border border-[#ede1d6] bg-[#fdf9f4] p-4 dark:border-[#4f3d31] dark:bg-[#201815]">
                    <SubscribeDetail
                      subscribe={{
                        ...item,
                        name: undefined,
                      }}
                    />
                  </div>
                </CardContent>

                <Separator className="bg-[#ede2d8] dark:bg-[#4a392e]" />

                <CardFooter className="flex items-end justify-between gap-4 p-6 pt-5">
                  <div>
                    <h2 className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-[#fff4ea]">
                      <Display type="currency" value={item.unit_price} />
                    </h2>
                    <div className="text-[#7d6b5e] text-sm dark:text-[#bfa998]">
                      /
                      {unitTimeMap[item.unit_time || "Month"] || item.unit_time}
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "rounded-2xl px-6 transition-all duration-300",
                      selected
                        ? "bg-[#6f4e37] text-white shadow-[0_18px_38px_-26px_rgba(111,78,55,0.5)] hover:bg-[#5d4330]"
                        : "bg-[#f6ede4] text-[#6f4e37] hover:bg-[#f0e1d1] dark:bg-[#2d231c] dark:text-[#f3e4d8] dark:hover:bg-[#3a2c23]"
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
      <div className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#9b6c44_0%,#7a5538_100%)] font-semibold text-sm text-white shadow-[0_14px_28px_-18px_rgba(111,78,55,0.8)]">
        {index}
      </div>
      <h2 className="font-semibold text-[#2f241d] text-[1.55rem] tracking-tight dark:text-[#fff4ea]">
        {title}
      </h2>
    </div>
  );
}

function HeroListItem({ text }: { text: string }) {
  return (
    <div className="hover:-translate-y-0.5 rounded-[20px] border border-[#ead9cb] bg-white/55 px-4 py-3 text-[#5f5247] text-sm leading-6 shadow-[0_14px_34px_-28px_rgba(111,78,55,0.22)] backdrop-blur-sm transition-all duration-300 hover:bg-white/80 dark:border-[#4f3d31] dark:bg-[#261d18]/88 dark:text-[#dcc9ba] dark:hover:bg-[#2f241d]">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex size-5 items-center justify-center rounded-full bg-[#9b6c44] text-white shadow-[0_10px_22px_-16px_rgba(111,78,55,0.8)]">
          <Icon className="size-3" icon="uil:check" />
        </div>
        <span>{text}</span>
      </div>
    </div>
  );
}

function FlowPill({ index, text }: { index: string; text: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d5c7] bg-white/72 px-3 py-1.5 text-[#765842] text-xs shadow-[0_10px_26px_-24px_rgba(111,78,55,0.4)] backdrop-blur-sm dark:border-[#554133] dark:bg-[#2a201a]/88 dark:text-[#d9c3b1]">
      <span className="flex size-5 items-center justify-center rounded-full bg-[#f2e1d2] font-semibold text-[#8b6447] dark:bg-[#473429] dark:text-[#f0ceb0]">
        {index}
      </span>
      <span>{text}</span>
    </div>
  );
}

function FloatingChip({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  return (
    <div
      className={cn(
        "group-hover:-translate-y-1 absolute rounded-full border border-[#ead8c7] bg-white/84 px-3 py-1.5 text-[#785b44] text-xs shadow-[0_16px_34px_-26px_rgba(111,78,55,0.35)] backdrop-blur-md transition-all duration-500 dark:border-[#5b4537] dark:bg-[#2b211b]/88 dark:text-[#e0cab8]",
        className
      )}
    >
      {text}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="group-hover:-translate-y-0.5 rounded-[20px] border border-[#ece0d4] bg-white/82 px-4 py-3 shadow-[0_12px_30px_-28px_rgba(111,78,55,0.22)] transition-transform duration-300 dark:border-[#4f3d31] dark:bg-[#281f19]">
      <div className="text-[#9b8b7d] text-[11px] uppercase tracking-[0.14em] dark:text-[#a99280]">
        {label}
      </div>
      <div className="mt-1 font-medium text-[#2f241d] text-sm dark:text-[#f5e7da]">
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
