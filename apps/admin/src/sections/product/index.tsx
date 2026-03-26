import { Badge } from "@workspace/ui/components/badge";
import { Icon } from "@workspace/ui/composed/icon";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import { useSubscribe } from "@/stores/subscribe";
import SubscribeTable from "./subscribe-table";

export default function Product() {
  const { t } = useTranslation("product");
  const { subscribes } = useSubscribe();

  const visibleCount = subscribes.filter((item) => item.show).length;
  const sellableCount = subscribes.filter((item) => item.sell).length;
  const starterPrice = subscribes.reduce<number | null>((min, item) => {
    if (typeof item.unit_price !== "number") return min;
    if (min === null) return item.unit_price;
    return Math.min(min, item.unit_price);
  }, null);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] border border-[#eadfd3] bg-[linear-gradient(135deg,#fff8f2_0%,#f6eee5_48%,#f0e3d6_100%)] p-6 shadow-[0_24px_60px_-46px_rgba(121,93,67,0.24)] dark:border-white/10 dark:bg-[linear-gradient(135deg,#2b211c_0%,#241b17_48%,#1d1714_100%)]">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dcc9b7] bg-white/80 px-3 py-1 text-[#8d6748] text-xs uppercase tracking-[0.16em] dark:border-white/10 dark:bg-white/8 dark:text-[#e2bc96]">
              <Icon className="size-4" icon="uil:box" />
              Product Management
            </div>
            <div className="space-y-3">
              <h1 className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                {t("title", "订阅商品管理")}
              </h1>
              <p className="max-w-3xl text-[#766558] text-sm leading-7 dark:text-white/65">
                这里是冰咖后台里最接近运营决策的一层。套餐名称、价格、折扣、流量、设备数和可售状态，都会直接影响前台展示与购买体验。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-full border border-[#e5d4c4] bg-[#fffaf5] px-3 py-1 text-[#7a5b44] shadow-none dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]">
                建议保留商品 ID
              </Badge>
              <Badge className="rounded-full border border-[#e5d4c4] bg-[#fffaf5] px-3 py-1 text-[#7a5b44] shadow-none dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]">
                优先编辑现有商品
              </Badge>
              <Badge className="rounded-full border border-[#e5d4c4] bg-[#fffaf5] px-3 py-1 text-[#7a5b44] shadow-none dark:border-white/10 dark:bg-white/6 dark:text-[#e2bc96]">
                前台购买页实时受影响
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard
              icon="uil:layers-alt"
              label="商品总数"
              value={`${subscribes.length} 个`}
            />
            <MetricCard
              icon="uil:eye"
              label="前台可见"
              value={`${visibleCount} 个`}
            />
            <MetricCard
              icon="uil:shopping-bag"
              label="当前可售"
              value={`${sellableCount} 个${starterPrice !== null ? " · " : ""}${
                starterPrice !== null ? "起售价 " : ""
              }${starterPrice !== null ? "¥" : ""}`}
              valueNode={
                starterPrice !== null ? (
                  <span className="inline-flex items-center gap-1">
                    <span>{`${sellableCount} 个 · 起售价`}</span>
                    <Display type="currency" value={starterPrice} />
                  </span>
                ) : undefined
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/78 p-4 shadow-[0_20px_48px_-36px_rgba(121,93,67,0.22)] backdrop-blur dark:border-white/10 dark:bg-[#1a1512]/76">
        <div className="mb-4 flex flex-col gap-3 border-[#eadfd3] border-b px-2 pb-4 dark:border-white/10">
          <div className="flex items-center gap-2 text-[#9b8a7b] text-xs uppercase tracking-[0.14em] dark:text-white/40">
            <Icon className="size-4" icon="uil:setting" />
            Product Console
          </div>
          <p className="text-[#6f5c4f] text-sm leading-7 dark:text-white/60">
            建议先把冰咖三档套餐稳定下来，再扩展更多周期与旗舰档位。后台优先保证名称清晰、价格梯度合理、`show/sell`
            状态正确。
          </p>
        </div>
        <SubscribeTable />
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueNode,
}: {
  icon: string;
  label: string;
  value: string;
  valueNode?: ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfd3] bg-white/82 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/6">
      <div className="flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:text-[#e2bc96]">
        <Icon className="size-4" icon={icon} />
        {label}
      </div>
      <div className="mt-2 font-medium text-[#2f241d] text-sm dark:text-white">
        {valueNode || value}
      </div>
    </div>
  );
}
