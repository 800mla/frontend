"use client";

import { useQuery } from "@tanstack/react-query";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { cn } from "@workspace/ui/lib/utils";
import { getAvailablePaymentMethods } from "@workspace/ui/services/user/portal";
import type React from "react";
import { memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";

interface PaymentMethodsProps {
  value: number;
  onChange: (value: number) => void;
  balance?: boolean;
  onLoaded?: (methods: API.PaymentMethod[]) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  value,
  onChange,
  balance = true,
  onLoaded,
}) => {
  const { t } = useTranslation("subscribe");

  const { data } = useQuery({
    queryKey: ["getAvailablePaymentMethods", { balance }],
    queryFn: async () => {
      const { data } = await getAvailablePaymentMethods();
      const list = data.data?.list || [];
      return balance ? list : list.filter((item) => item.id !== -1);
    },
  });

  // Only set a default when the current value is not a valid option.
  // This avoids resetting the user's selection on refetch (common on mobile).
  // Prefer non-balance methods when possible.
  useEffect(() => {
    if (!data || data.length === 0) return;
    const valid = data.some((m) => String(m.id) === String(value));
    if (valid) return;

    const preferred = data.find((m) => m.id !== -1)?.id ?? data[0]!.id;
    onChange(preferred);
  }, [data, onChange, value]);

  useEffect(() => {
    onLoaded?.(data || []);
  }, [data, onLoaded]);

  return (
    <>
      <div className="space-y-3">
        <div className="font-semibold">
          {t("paymentMethod", "Payment Method")}
        </div>
        <div className="rounded-[22px] border border-[#ead6c3] bg-[linear-gradient(180deg,#fff8f0_0%,#fff3e7_100%)] px-4 py-3 text-[#7a583e] text-sm leading-6 shadow-[0_14px_34px_-28px_rgba(111,78,55,0.26)] dark:border-[#5a4537] dark:bg-[linear-gradient(180deg,#31241d_0%,#261c17_100%)] dark:text-[#e9ccb1]">
          不同支付通道会收取不同的平台手续费，该费用由支付平台向用户收取，并非本站额外服务费。
          选择通道后，右侧订单金额会实时更新为当前通道的实际试算结果。
        </div>
      </div>
      {data && data.length === 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-amber-700 text-sm dark:text-amber-300">
          {t(
            "paymentMethodUnavailable",
            "当前没有可用的在线支付方式。请先在后台启用至少一种外部支付通道，否则公开购买无法完成。"
          )}
        </div>
      )}
      <RadioGroup
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1"
        onValueChange={(val) => {
          onChange(Number(val));
        }}
        value={String(value)}
      >
        {data?.map((item) => (
          <div className="relative" key={item.id}>
            <RadioGroupItem
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              id={String(item.id)}
              value={String(item.id)}
            />
            <Label
              className={cn(
                "hover:-translate-y-1 flex min-h-[130px] flex-col items-start justify-between rounded-[24px] border border-[#e8ddd2] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,241,0.96))] p-4 text-left shadow-[0_18px_40px_-34px_rgba(111,78,55,0.18)] transition-all duration-300 hover:border-[#caa887] hover:shadow-[0_24px_48px_-32px_rgba(111,78,55,0.28)] dark:border-[#4f3d31] dark:bg-[linear-gradient(180deg,#241b17_0%,#1d1612_100%)] dark:hover:border-[#8f6c51] dark:hover:bg-[#2a201a]",
                String(value) === String(item.id)
                  ? "border-[#b98960] bg-[linear-gradient(180deg,#fffaf5_0%,#f8ede2_100%)] shadow-[0_24px_52px_-34px_rgba(111,78,55,0.34)] dark:bg-[linear-gradient(180deg,#36271f_0%,#2a1f19_100%)] dark:shadow-[0_24px_52px_-34px_rgba(0,0,0,0.52)]"
                  : ""
              )}
              htmlFor={String(item.id)}
            >
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-2xl border border-[#ebdfd3] bg-[#fffaf5] shadow-[0_14px_28px_-24px_rgba(111,78,55,0.28)] dark:border-[#5b4638] dark:bg-[#2d231c]">
                    <img
                      alt={item.name}
                      height={40}
                      src={item.icon || "./assets/payment/balance.svg"}
                      width={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-[#2f241d] text-sm dark:text-[#fff3e8]">
                      {item.name}
                    </div>
                    <div className="text-[#8e7764] text-xs dark:text-[#ad9784]">
                      {renderFeeDescription(item)}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] leading-none",
                    String(value) === String(item.id)
                      ? "border-[#c69b78] bg-[#f4e4d4] text-[#7a5538] dark:border-[#7a5c48] dark:bg-[#4a3528] dark:text-[#f6dfcb]"
                      : "border-[#e7d9cb] bg-white/75 text-[#8d6748] dark:border-[#544133] dark:bg-[#2a2019] dark:text-[#d7c1af]"
                  )}
                >
                  {renderFeeBadge(item)}
                </div>
              </div>

              <div className="w-full rounded-[18px] border border-[#eadccf] border-dashed bg-[#fcf6f0] px-3 py-2 text-[#6b584b] text-xs leading-5 dark:border-[#4f3d31] dark:bg-[#221914] dark:text-[#bfaa98]">
                {item.description ||
                  "平台手续费已公开显示，实际本单金额以下单试算为准。"}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </>
  );
};

export default memo(PaymentMethods);

function renderFeeBadge(method: API.PaymentMethod) {
  if (method.fee_mode === 1) {
    return `平台手续费 ${method.fee_percent}%`;
  }

  if (method.fee_mode === 2) {
    return (
      <>
        平台手续费 <Display type="currency" value={method.fee_amount} />
      </>
    );
  }

  return "平台免手续费";
}

function renderFeeDescription(method: API.PaymentMethod) {
  if (method.fee_mode === 1) {
    return `当前通道按 ${method.fee_percent}% 收取平台手续费`;
  }

  if (method.fee_mode === 2) {
    return "当前通道按固定金额收取平台手续费";
  }

  return "当前通道不收取平台手续费";
}
