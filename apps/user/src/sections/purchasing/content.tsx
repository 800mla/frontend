"use client";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { prePurchaseOrder, purchase } from "@workspace/ui/services/user/portal";
import { LoaderCircle } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Display } from "@/components/display";
import { SubscribeBilling } from "@/sections/subscribe/billing";
import CouponInput from "@/sections/subscribe/coupon-input";
import { SubscribeDetail } from "@/sections/subscribe/detail";
import DurationSelector from "@/sections/subscribe/duration-selector";
import PaymentMethods from "@/sections/subscribe/payment-methods";
import { useGlobalStore } from "@/stores/global";

type SubscribeFeature = {
  icon?: string;
  label: string;
  type: "default" | "success" | "destructive";
};

export default function Content({
  subscription,
}: {
  subscription?: API.Subscribe;
}) {
  const { t } = useTranslation("subscribe");
  const unitTimeMap: Record<string, string> = {
    Day: t("Day", "Day"),
    Hour: t("Hour", "Hour"),
    Minute: t("Minute", "Minute"),
    Month: t("Month", "Month"),
    NoLimit: t("NoLimit", "No Limit"),
    Year: t("Year", "Year"),
  };
  const { common } = useGlobalStore();
  const navigate = useNavigate();
  const [params, setParams] = useState<API.PortalPurchaseRequest>({
    quantity: 1,
    subscribe_id: 0,
    payment: -1,
    coupon: "",
    auth_type: "email",
    identifier: "",
    password: "",
  });
  const [loading, startTransition] = useTransition();
  const [isEmailValid, setIsEmailValid] = useState({
    valid: false,
    message: "",
  });
  const [paymentMethods, setPaymentMethods] = useState<API.PaymentMethod[]>([]);

  const { data: order } = useQuery({
    enabled:
      !!subscription?.id &&
      params.payment !== undefined &&
      params.payment !== null &&
      params.payment !== -1,
    queryKey: [
      "preCreateOrder",
      params.coupon,
      params.quantity,
      params.payment,
    ],
    queryFn: async () => {
      const { data } = await prePurchaseOrder({
        ...params,
        subscribe_id: subscription?.id as number,
      } as API.PrePurchaseOrderRequest);
      return data.data;
    },
  });

  useEffect(() => {
    if (subscription) {
      setParams((prev) => ({
        ...prev,
        quantity: 1,
        subscribe_id: subscription?.id,
      }));
    }
  }, [subscription]);

  const handleChange = useCallback(
    (field: keyof typeof params, value: string | number) => {
      setParams((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!(params.identifier && isEmailValid.valid)) {
      toast.error("请先填写有效邮箱后再继续。");
      return;
    }
    if (paymentMethods.length === 0) {
      toast.error("当前没有可用的在线支付方式，请先在后台启用支付通道。");
      return;
    }
    if (
      !paymentMethods.some(
        (method) => String(method.id) === String(params.payment)
      )
    ) {
      toast.error("请选择有效的支付方式后再提交。");
      return;
    }

    startTransition(async () => {
      try {
        const { data } = await purchase(params);
        const { order_no } = data.data!;
        if (order_no) {
          localStorage.setItem(
            order_no,
            JSON.stringify({
              auth_type: params.auth_type,
              identifier: params.identifier,
            })
          );
          navigate({ to: "/purchasing/order", search: { order_no } });
          return;
        }
        toast.error("订单已创建，但未返回订单号，请检查支付配置。");
      } catch (error) {
        console.log(error);
      }
    });
  }, [params, navigate, isEmailValid.valid, paymentMethods]);

  if (!subscription) {
    return (
      <div className="p-6 text-center">
        {t("subscriptionNotFound", "Subscription not found")}
      </div>
    );
  }

  const parsedDescription = parseSubscribeDescription(subscription.description);
  const selectedPaymentMethod = paymentMethods.find(
    (method) => String(method.id) === String(params.payment)
  );
  const unitTimeLabel =
    unitTimeMap[subscription.unit_time || "Month"] || subscription.unit_time;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <StepHeader
              description="用于接收订单通知、自动生成的初始密码以及购买完成后的订阅信息。"
              index="02"
              title="创建你的账户"
            />
            <Card className="rounded-[30px] border-[#ebe1d7] bg-white shadow-[0_20px_56px_-44px_rgba(121,93,67,0.18)] dark:border-white/10 dark:bg-[#171412]">
              <CardHeader className="space-y-3 p-6 pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="font-semibold text-[#2f241d] text-xl tracking-tight dark:text-white">
                      {t(
                        "emailInputTitle",
                        "Enter the email address for your {{siteName}} account",
                        {
                          siteName: common.site.site_name,
                        }
                      )}
                    </div>
                    <p className="max-w-2xl text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                      购买成功后，你可以直接用这个邮箱登录并查看订阅状态、订单记录与使用情况。
                    </p>
                  </div>

                  <div className="hidden rounded-2xl border border-[#eadfd3] bg-[#faf4ee] px-4 py-3 text-[#7a5b44] text-sm lg:block dark:border-white/10 dark:bg-white/6 dark:text-white/70">
                    匿名购买流程
                  </div>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 p-6 pt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoCard
                    icon="uil:envelope-check"
                    label="邮箱验证"
                    value="作为你的账户标识与订单接收地址"
                  />
                  <InfoCard
                    icon="uil:keyhole-circle"
                    label="密码策略"
                    value="可自定义，也可由系统自动生成"
                  />
                  <InfoCard
                    icon="uil:shield-check"
                    label="账户用途"
                    value="购买后查看订阅、订单与流量状态"
                  />
                </div>

                <div className="rounded-[26px] border border-[#eee4da] bg-[#fcf8f3] p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="grid gap-5">
                    <div className="flex flex-col gap-2">
                      <EnhancedInput
                        className={cn(
                          "h-12 rounded-2xl border-[#e4d6c9] bg-white/90 px-4 text-[0.98rem] shadow-none dark:border-white/10 dark:bg-white/5",
                          {
                            "border-destructive":
                              !isEmailValid.valid && params.identifier !== "",
                          }
                        )}
                        onValueChange={(value: string) => {
                          const email = value as string;
                          setParams((prev) => ({
                            ...prev,
                            identifier: email,
                          }));
                          const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                          if (!reg.test(email)) {
                            setIsEmailValid({
                              valid: false,
                              message: t(
                                "invalidEmail",
                                "Please enter a valid email address"
                              ),
                            });
                          } else if (common.auth.email.enable_domain_suffix) {
                            const domain = email.split("@")[1];
                            const isValid =
                              common.auth.email?.domain_suffix_list
                                .split("\n")
                                .includes(domain || "");
                            if (!isValid) {
                              setIsEmailValid({
                                valid: false,
                                message: t(
                                  "emailDomainNotAllowed",
                                  "Email domain is not in the whitelist"
                                ),
                              });
                              return;
                            }
                            setIsEmailValid({
                              valid: true,
                              message: "",
                            });
                          } else {
                            setIsEmailValid({
                              valid: true,
                              message: "",
                            });
                          }
                        }}
                        placeholder="Email"
                        required
                        type="email"
                        value={params.identifier || ""}
                      />
                      <p
                        className={cn("text-xs", {
                          "text-destructive":
                            !isEmailValid.valid && params.identifier !== "",
                          "text-[#8b7b6f] dark:text-white/45":
                            isEmailValid.valid || params.identifier === "",
                        })}
                      >
                        {isEmailValid.message ||
                          t(
                            "emailRequired",
                            "Please enter your email address."
                          )}
                      </p>
                    </div>

                    {params.identifier && isEmailValid.valid && (
                      <div className="grid gap-2">
                        <EnhancedInput
                          className="h-12 rounded-2xl border-[#e4d6c9] bg-white/90 px-4 text-[0.98rem] shadow-none dark:border-white/10 dark:bg-white/5"
                          onValueChange={(value: string) =>
                            handleChange("password", value)
                          }
                          placeholder="Password"
                          type="password"
                          value={params.password || ""}
                        />
                        <p className="text-[#8b7b6f] text-xs leading-6 dark:text-white/45">
                          {t(
                            "passwordHint",
                            "If you do not enter a password, we will automatically generate one and send it to your email."
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <StepHeader
              description="确认购买时长、优惠券与支付方式。所有价格试算会根据当前选择自动刷新。"
              index="03"
              title="确认订单，完成支付"
            />
            <Card className="rounded-[30px] border-[#ebe1d7] bg-white shadow-[0_20px_56px_-44px_rgba(121,93,67,0.18)] dark:border-white/10 dark:bg-[#171412]">
              <CardContent className="grid gap-8 p-6">
                <div className="rounded-[26px] border border-[#eee4da] bg-[#fcf8f3] p-5 dark:border-white/10 dark:bg-white/5">
                  <DurationSelector
                    discounts={subscription.discount}
                    onChange={(value: number) =>
                      handleChange("quantity", value)
                    }
                    quantity={params.quantity!}
                    unitTime={unitTimeLabel}
                  />
                </div>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                  <div className="rounded-[26px] border border-[#eee4da] bg-[#fcf8f3] p-5 dark:border-white/10 dark:bg-white/5">
                    <CouponInput
                      coupon={params.coupon}
                      onChange={(value: string) =>
                        handleChange("coupon", value)
                      }
                    />
                  </div>

                  <div className="rounded-[26px] border border-[#eee4da] bg-[#fcf8f3] p-5 dark:border-white/10 dark:bg-white/5">
                    <PaymentMethods
                      balance={false}
                      onChange={(value: number) =>
                        handleChange("payment", value)
                      }
                      onLoaded={setPaymentMethods}
                      value={params.payment!}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="xl:pt-[54px]">
          <div className="xl:sticky xl:top-24">
            <Card className="overflow-hidden rounded-[32px] border-[#dfc9b5] bg-[linear-gradient(180deg,#fffaf5_0%,#f9f0e7_100%)] shadow-[0_26px_72px_-48px_rgba(121,93,67,0.28)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#231c18_0%,#171412_100%)]">
              <div className="border-[#eadccf] border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0))] px-6 py-5 dark:border-white/10 dark:bg-none">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[#9b8a7b] text-xs uppercase tracking-[0.16em] dark:text-white/40">
                      Order Summary
                    </div>
                    <div className="mt-2 font-semibold text-[#2f241d] text-[1.55rem] tracking-tight dark:text-white">
                      {subscription.name}
                    </div>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f6ebe0] text-[#8d6748] dark:bg-white/8 dark:text-[#e2bc96]">
                    <Icon className="size-6" icon="uil:receipt-alt" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <SummaryPill
                    label="当前周期"
                    value={`${params.quantity || 1} ${unitTimeLabel}`}
                  />
                  <SummaryPill
                    label="支付方式"
                    value={selectedPaymentMethod?.name || "待选择"}
                  />
                  <SummaryPill
                    label="联系邮箱"
                    value={params.identifier || "待填写"}
                  />
                  <SummaryPill
                    label="优惠券"
                    value={params.coupon || "未使用"}
                  />
                </div>
              </div>

              <CardContent className="grid gap-6 p-6">
                <div className="rounded-[24px] border border-[#eadfd3] bg-white/72 p-5 dark:border-white/10 dark:bg-white/5">
                  <div className="mb-4 flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:text-[#e2bc96]">
                    <Icon className="size-4" icon="uil:star" />
                    Plan Highlights
                  </div>
                  <ul className="space-y-3">
                    {parsedDescription.features.length > 0 ? (
                      parsedDescription.features
                        .slice(0, 4)
                        .map((feature: SubscribeFeature, index: number) => (
                          <li
                            className={cn(
                              "flex items-start gap-2 text-[#5f5146] text-sm leading-6 dark:text-white/70",
                              feature.type === "destructive" &&
                                "line-through opacity-50"
                            )}
                            key={index}
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
                        ))
                    ) : (
                      <li className="text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
                        {parsedDescription.description ||
                          "当前套餐暂无额外说明，可直接完成购买。"}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-[24px] border border-[#eadfd3] bg-white/72 p-5 dark:border-white/10 dark:bg-white/5">
                  <SubscribeDetail
                    subscribe={{
                      ...subscription,
                      quantity: params.quantity,
                    }}
                  />
                </div>

                <div className="rounded-[24px] border border-[#eadfd3] bg-white/72 p-5 dark:border-white/10 dark:bg-white/5">
                  <SubscribeBilling
                    order={{
                      ...order,
                      quantity: params.quantity,
                      unit_price: subscription.unit_price,
                      unit_time: subscription.unit_time,
                      show_original_price: subscription.show_original_price,
                    }}
                  />
                </div>

                <Separator className="bg-[#eadccf] dark:bg-white/10" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[#8b7b6f] text-sm dark:text-white/45">
                      {t("billing.total", "Total")}
                    </div>
                    <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-white">
                      <Display
                        type="currency"
                        value={
                          order?.amount ||
                          order?.price ||
                          subscription.unit_price
                        }
                      />
                    </div>
                  </div>

                  <Button
                    className="h-12 rounded-2xl bg-[#6f4e37] px-6 text-white hover:bg-[#5d4330]"
                    disabled={
                      !isEmailValid.valid ||
                      loading ||
                      paymentMethods.length === 0
                    }
                    onClick={handleSubmit}
                    size="lg"
                  >
                    {loading && <LoaderCircle className="mr-2 animate-spin" />}
                    {t("buyNow", "Buy Now")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepHeader({
  index,
  title,
  description,
}: {
  index: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-[#63baa9] font-semibold text-sm text-white shadow-[0_12px_24px_-16px_rgba(99,186,169,0.7)]">
          {index}
        </div>
        <h2 className="font-semibold text-[#2f241d] text-[1.45rem] tracking-tight dark:text-white">
          {title}
        </h2>
      </div>
      <p className="text-[#7d6b5e] text-sm leading-7 dark:text-white/60">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadfd3] bg-white/75 px-4 py-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:text-[#e2bc96]">
        <Icon className="size-4" icon={icon} />
        {label}
      </div>
      <div className="mt-2 text-[#2f241d] text-sm leading-6 dark:text-white/70">
        {value}
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[#e9dbcf] bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="text-[#9b8a7b] text-[11px] uppercase tracking-[0.14em] dark:text-white/40">
        {label}
      </div>
      <div className="mt-1 truncate font-medium text-[#2f241d] text-sm dark:text-white">
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
