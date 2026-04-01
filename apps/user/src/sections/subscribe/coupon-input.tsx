"use client";

import { Input } from "@workspace/ui/components/input";
import type React from "react";
import { useTranslation } from "react-i18next";

interface CouponInputProps {
  coupon?: string;
  onChange: (value: string) => void;
  status?: {
    tone: "default" | "success" | "warning";
    text: string;
  };
}

const statusClassMap = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-400",
} as const;

const CouponInput: React.FC<CouponInputProps> = ({
  coupon,
  onChange,
  status,
}) => {
  const { t } = useTranslation("subscribe");

  return (
    <>
      <div className="font-semibold">{t("coupon", "Coupon")}</div>
      <Input
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder={t("enterCoupon", "Enter Coupon")}
        value={coupon}
      />
      {status?.text ? (
        <p className={`mt-2 text-xs leading-6 ${statusClassMap[status.tone]}`}>
          {status.text}
        </p>
      ) : null}
    </>
  );
};

export default CouponInput;
