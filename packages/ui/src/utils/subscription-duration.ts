type SubscriptionDurationLike = {
  duration_value?: number | null;
  duration_unit?: string | null;
  unit_time?: string | null;
  value?: number | null;
  unit?: string | null;
};

type TranslateUnitLabel = (key: string, fallback: string) => string;

type FormatDurationOptions = {
  locale?: string;
};

const DEFAULT_UNIT = "Month";

function isZhLocale(locale?: string) {
  return locale?.toLowerCase().startsWith("zh") ?? false;
}

function pluralizeEnglishUnit(unit: string, value: number) {
  const pluralMap: Record<string, string> = {
    Day: value === 1 ? "day" : "days",
    Hour: value === 1 ? "hour" : "hours",
    Minute: value === 1 ? "minute" : "minutes",
    Month: value === 1 ? "month" : "months",
    Year: value === 1 ? "year" : "years",
  };

  return pluralMap[unit] || unit.toLowerCase();
}

export function resolveSubscriptionDuration(input?: SubscriptionDurationLike) {
  const rawValue = Number(input?.duration_value ?? input?.value);
  const value = Number.isFinite(rawValue) && rawValue > 0 ? rawValue : 1;
  const unit =
    input?.duration_unit || input?.unit || input?.unit_time || DEFAULT_UNIT;

  return {
    value,
    unit,
  };
}

export function multiplySubscriptionDuration(
  quantity: number | undefined,
  input?: SubscriptionDurationLike
) {
  const { value, unit } = resolveSubscriptionDuration(input);
  const multiplier =
    Number.isFinite(Number(quantity)) && Number(quantity) > 0
      ? Number(quantity)
      : 1;

  if (unit === "NoLimit") {
    return {
      value,
      unit,
    };
  }

  return {
    value: value * multiplier,
    unit,
  };
}

export function formatSubscriptionDuration(
  input: SubscriptionDurationLike | undefined,
  translateUnit: TranslateUnitLabel,
  options: FormatDurationOptions = {}
) {
  const { locale } = options;
  const { value, unit } = resolveSubscriptionDuration(input);
  const isZh = isZhLocale(locale);
  const unitLabel = translateUnit(unit, unit);

  if (unit === "NoLimit") {
    return unitLabel;
  }

  if (isZh) {
    if (unit === "Month" && value === 1) return "月卡";
    if (unit === "Month" && value === 3) return "季卡";
    if ((unit === "Month" && value === 12) || (unit === "Year" && value === 1))
      return "年卡";

    return `${value}${unitLabel}`;
  }

  if (unit === "Month" && value === 1) return "Monthly";
  if (unit === "Month" && value === 3) return "Quarterly";
  if ((unit === "Month" && value === 12) || (unit === "Year" && value === 1))
    return "Yearly";

  return `${value} ${pluralizeEnglishUnit(unit, value)}`;
}

export function formatSubscriptionDurationWithQuantity(
  quantity: number | undefined,
  input: SubscriptionDurationLike | undefined,
  translateUnit: TranslateUnitLabel,
  options: FormatDurationOptions = {}
) {
  return formatSubscriptionDuration(
    multiplySubscriptionDuration(quantity, input),
    translateUnit,
    options
  );
}
