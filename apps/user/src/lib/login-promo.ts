"use client";

export const LOGIN_PROMO_COUPON_CODE = "BINGKA-LOGIN";

function getPromoDeadlineKey(userId: number | string) {
  return `bingka-dashboard-promo-deadline-${userId}`;
}

function getPromoCouponKey(userId: number | string) {
  return `bingka-dashboard-promo-coupon-${userId}`;
}

export function storeLoginPromoCoupon(
  userId: number | string | undefined,
  couponCode: string
) {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.setItem(getPromoCouponKey(userId), couponCode.trim());
}

export function getLoginPromoCoupon(userId: number | string | undefined) {
  if (!userId || typeof window === "undefined") return "";

  const deadline = Number(
    window.localStorage.getItem(getPromoDeadlineKey(userId)) || 0
  );

  if (deadline && deadline <= Date.now()) {
    window.localStorage.removeItem(getPromoCouponKey(userId));
    return "";
  }

  return window.localStorage.getItem(getPromoCouponKey(userId)) || "";
}

export function clearLoginPromoCoupon(userId: number | string | undefined) {
  if (!userId || typeof window === "undefined") return;
  window.localStorage.removeItem(getPromoCouponKey(userId));
}
