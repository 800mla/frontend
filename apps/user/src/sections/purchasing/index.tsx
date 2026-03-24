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
import { cn } from "@workspace/ui/lib/utils";
import { getSubscription } from "@workspace/ui/services/user/portal";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import Content from "./content";

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
    <main className="container space-y-12">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("guestPurchaseTitle", "购买套餐")}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {t(
              "guestPurchaseDescription",
              "先选择适合你的套餐，再在下方直接完成购买。"
            )}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredData.map((item) => (
            <Card
              className={cn("relative flex flex-col", {
                "border-primary/30 shadow-[0_18px_48px_-34px_hsl(var(--primary))]":
                  item.id === activeId,
              })}
              key={item.id}
            >
              <CardHeader className="font-medium text-xl">{item.name}</CardHeader>
              <CardContent className="flex flex-grow flex-col gap-4 text-sm">
                <SubscribeDetail
                  subscribe={{
                    ...item,
                    name: undefined,
                  }}
                />
              </CardContent>
              <Separator />
              <CardFooter className="flex items-center justify-between gap-4">
                <h2 className="font-semibold text-2xl">
                  <Display type="currency" value={item.unit_price} />
                  <span className="ml-1 font-medium text-sm text-muted-foreground">
                    /{unitTimeMap[item.unit_time || "Month"] || item.unit_time}
                  </span>
                </h2>
                <Button onClick={() => selectSubscription(item.id)}>
                  {item.id === activeId
                    ? t("selected", "已选择")
                    : t("choosePlan", "选择套餐")}
                </Button>
              </CardFooter>
            </Card>
          ))}
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
