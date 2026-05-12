"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { formatSubscriptionDurationWithQuantity } from "@workspace/ui/utils";
import type React from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

interface DurationSelectorProps {
  quantity: number;
  durationValue?: number;
  durationUnit?: string;
  unitTime?: string;
  discounts?: Array<{ quantity: number; discount: number }>;
  onChange: (value: number) => void;
  showOriginalPrice?: boolean;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  quantity,
  durationValue,
  durationUnit,
  unitTime = "Month",
  discounts = [],
  onChange,
  showOriginalPrice = true,
}) => {
  const { t, i18n } = useTranslation("subscribe");
  const handleChange = useCallback(
    (value: string) => {
      onChange(Number(value));
    },
    [onChange]
  );

  const DurationOption: React.FC<{ value: string; label: string }> = ({
    value,
    label,
  }) => (
    <div className="relative">
      <RadioGroupItem className="peer sr-only" id={value} value={value} />
      <Label
        className="relative flex h-full flex-col items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
        htmlFor={value}
      >
        {label}
      </Label>
    </div>
  );

  const currentDiscount = discounts?.find(
    (item) => item.quantity === quantity
  )?.discount;
  const discountPercentage = currentDiscount ? 100 - currentDiscount : 0;
  const resolvedUnit = durationUnit || unitTime;
  const durationSource = {
    duration_value: durationValue,
    duration_unit: durationUnit,
    unit_time: unitTime,
  };

  return (
    <>
      <div className="font-semibold">
        {t("purchaseDuration", "Purchase Duration")}
      </div>
      <RadioGroup
        className="flex flex-wrap gap-3"
        onValueChange={handleChange}
        value={String(quantity)}
      >
        {showOriginalPrice && resolvedUnit !== "Minute" && (
          <DurationOption
            label={formatSubscriptionDurationWithQuantity(
              1,
              durationSource,
              t,
              {
                locale: i18n.language,
              }
            )}
            value="1"
          />
        )}
        {discounts?.map((item) => (
          <DurationOption
            key={item.quantity}
            label={formatSubscriptionDurationWithQuantity(
              item.quantity,
              durationSource,
              t,
              {
                locale: i18n.language,
              }
            )}
            value={String(item.quantity)}
          />
        ))}
      </RadioGroup>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {t("discountInfo", "Discount Info")}:
        </span>
        {discountPercentage > 0 ? (
          <Badge className="h-6 text-sm" variant="destructive">
            -{discountPercentage.toFixed(2)}% {t("discount", "Discount")}
          </Badge>
        ) : (
          <span className="h-6 text-muted-foreground text-sm">--</span>
        )}
      </div>
    </>
  );
};

export default DurationSelector;
