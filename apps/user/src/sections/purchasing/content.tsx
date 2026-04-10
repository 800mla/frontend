"use client";

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import { sendEmailCode } from "@workspace/ui/services/common/common";
import {
  createPortalVerificationTicket,
  prePurchaseOrder,
  purchase,
  sendPortalCode,
} from "@workspace/ui/services/user/portal";
import { LoaderCircle } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
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
  const [isSendingPortalCode, startSendPortalCode] = useTransition();
  const [isVerifyingPortalEmail, startVerifyPortalEmail] = useTransition();
  const [isEmailValid, setIsEmailValid] = useState({
    valid: false,
    message: "",
  });
  const [paymentMethods, setPaymentMethods] = useState<API.PaymentMethod[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [portalVerificationTicket, setPortalVerificationTicket] = useState("");
  const [portalCodeTargetDate, setPortalCodeTargetDate] = useState<number>();
  const [portalCodeSeconds, setPortalCodeSeconds] = useState(0);
  const hasSelectedPayment =
    params.payment !== undefined &&
    params.payment !== null &&
    params.payment !== -1;
  const isReadyForPrecheck =
    !!subscription?.id &&
    hasSelectedPayment &&
    Boolean(params.identifier) &&
    isEmailValid.valid;

  const { data: order, isFetching: isCheckingPurchaseAvailability } = useQuery({
    enabled: isReadyForPrecheck,
    queryKey: [
      "prePurchaseOrder",
      subscription?.id,
      params.auth_type,
      params.identifier,
      params.password,
      params.coupon,
      params.quantity,
      params.payment,
    ],
    queryFn: async () => {
      const { data } = await prePurchaseOrder({
        auth_type: params.auth_type,
        identifier: params.identifier,
        password: params.password,
        payment: params.payment,
        subscribe_id: subscription?.id as number,
        quantity: params.quantity,
        coupon: params.coupon,
      } as API.PrePurchaseOrderRequest);
      return data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  const accountMode = order?.account_mode || "";
  const nextAction = order?.next_action || "none";
  const verificationType = order?.verification_type || "";
  const requiresEmailVerification = nextAction === "verify_email";
  const requiresPassword =
    order?.require_password ??
    (nextAction === "input_password" || requiresEmailVerification);
  const hasPassword = Boolean(params.password?.trim());
  const hasVerificationTicket = Boolean(portalVerificationTicket);
  const verificationCodeType: 1 | 2 = verificationType === "security" ? 2 : 1;
  const isPurchaseBlocked = order?.can_purchase === false;
  const canSubmitPurchase =
    isEmailValid.valid &&
    paymentMethods.length > 0 &&
    hasSelectedPayment &&
    !loading &&
    !isCheckingPurchaseAvailability &&
    (!requiresPassword || hasPassword) &&
    (!requiresEmailVerification || hasVerificationTicket) &&
    (order?.can_purchase === true ||
      (requiresEmailVerification && hasVerificationTicket));

  useEffect(() => {
    if (!subscription) return;

    setParams((prev) => ({
      ...prev,
      quantity: 1,
      subscribe_id: subscription.id,
    }));
  }, [subscription]);

  useEffect(() => {
    setVerificationCode("");
    setPortalVerificationTicket("");
  }, [params.identifier, params.auth_type]);

  useEffect(() => {
    const storedEndTime = localStorage.getItem("portal_verify_code_email");
    if (!storedEndTime) return;

    const endTime = Number.parseInt(storedEndTime, 10);
    if (endTime > Date.now()) {
      setPortalCodeTargetDate(endTime);
      setPortalCodeSeconds(
        Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      );
      return;
    }

    localStorage.removeItem("portal_verify_code_email");
  }, []);

  useEffect(() => {
    if (nextAction !== "verify_email" && portalVerificationTicket) {
      setPortalVerificationTicket("");
      setVerificationCode("");
    }
  }, [nextAction, portalVerificationTicket]);

  useEffect(() => {
    if (!portalCodeTargetDate) return;

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((portalCodeTargetDate - Date.now()) / 1000)
      );
      setPortalCodeSeconds(remaining);

      if (remaining === 0) {
        setPortalCodeTargetDate(undefined);
        setPortalCodeSeconds(0);
        localStorage.removeItem("portal_verify_code_email");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [portalCodeTargetDate]);

  const handleChange = useCallback(
    (field: keyof typeof params, value: string | number) => {
      setParams((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const setPortalCodeTimer = useCallback(() => {
    const endTime = Date.now() + common.verify_code.verify_code_interval * 1000;
    setPortalCodeTargetDate(endTime);
    localStorage.setItem("portal_verify_code_email", endTime.toString());
  }, [common.verify_code.verify_code_interval]);

  const handleSendPortalCode = useCallback(async () => {
    if (!(params.identifier && isEmailValid.valid)) {
      toast.error("请先填写有效邮箱后再继续。");
      return;
    }

    startSendPortalCode(async () => {
      try {
        await sendPortalCode({
          auth_type: params.auth_type,
          identifier: params.identifier,
        });
        setPortalCodeTimer();
      } catch (error: any) {
        const status = error?.status || error?.response?.status;
        if (status !== 404) {
          console.log(error);
          return;
        }

        try {
          await sendEmailCode({
            email: params.identifier,
            type: verificationCodeType,
          });
          setPortalCodeTimer();
        } catch (fallbackError) {
          console.log(fallbackError);
        }
      }
    });
  }, [
    params.identifier,
    params.auth_type,
    isEmailValid.valid,
    setPortalCodeTimer,
    verificationCodeType,
    startSendPortalCode,
  ]);

  const handleVerifyPortalEmail = useCallback(async () => {
    if (!(params.identifier && isEmailValid.valid)) {
      toast.error("请先填写有效邮箱后再继续。");
      return;
    }
    if (!verificationCode.trim()) {
      toast.error("请先填写邮箱验证码。");
      return;
    }

    startVerifyPortalEmail(async () => {
      try {
        const { data } = await createPortalVerificationTicket({
          auth_type: params.auth_type,
          identifier: params.identifier,
          code: verificationCode.trim(),
          scene: "portal_checkout",
        });
        const ticket = data.data?.portal_verification_ticket;
        if (!ticket) {
          toast.error("验证码已校验，但未返回购买授权，请稍后再试。");
          return;
        }
        setPortalVerificationTicket(ticket);
        toast.success("邮箱验证已通过，现在可以继续下单。");
      } catch (error) {
        console.log(error);
        setPortalVerificationTicket("");
      }
    });
  }, [
    params.auth_type,
    params.identifier,
    isEmailValid.valid,
    verificationCode,
    startVerifyPortalEmail,
  ]);

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
    if (isCheckingPurchaseAvailability) {
      toast.error("正在检查当前购买资格，请稍候再试。");
      return;
    }
    if (requiresPassword && !hasPassword) {
      toast.error(
        requiresEmailVerification
          ? verificationType === "security"
            ? "请先确认当前账号密码后继续购买。"
            : "请先设置登录密码后继续购买。"
          : "请先输入账号密码后继续购买。"
      );
      return;
    }
    if (requiresEmailVerification && !hasVerificationTicket) {
      toast.error("请先完成邮箱验证后再继续下单。");
      return;
    }
    if (
      order?.can_purchase === false &&
      nextAction !== "verify_email" &&
      nextAction !== "input_password"
    ) {
      toast.error(order?.purchase_block_reason || "当前条件下暂时无法购买。");
      return;
    }

    startTransition(async () => {
      try {
        const { data } = await purchase({
          ...params,
          portal_verification_ticket:
            portalVerificationTicket || params.portal_verification_ticket,
        });
        const { order_no, payable_amount } = data.data!;
        if (order_no) {
          localStorage.setItem(
            order_no,
            JSON.stringify({
              auth_type: params.auth_type,
              identifier: params.identifier,
              payable_amount,
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
  }, [
    hasPassword,
    hasVerificationTicket,
    params,
    navigate,
    isCheckingPurchaseAvailability,
    isEmailValid.valid,
    nextAction,
    paymentMethods,
    order,
    portalVerificationTicket,
    requiresEmailVerification,
    requiresPassword,
    verificationType,
  ]);

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
  const couponStatus = params.coupon
    ? order?.coupon_discount
      ? {
          text: `登录礼券已生效，预计优惠 ¥${Number(
            order.coupon_discount || 0
          ).toFixed(2)}`,
          tone: "success" as const,
        }
      : {
          text: "优惠码已自动带入，下方订单试算会显示真实减免；若后台未创建同名优惠券则不会生效。",
          tone: "default" as const,
        }
    : undefined;
  const unitTimeLabel =
    unitTimeMap[subscription.unit_time || "Month"] || subscription.unit_time;
  const selectedPaymentFeeRule = selectedPaymentMethod
    ? formatPaymentFeeRule(
        selectedPaymentMethod,
        common.currency.currency_symbol || ""
      )
    : "待选择";
  const effectiveFeeDisplay =
    order?.fee_amount !== undefined ? (
      <Display type="currency" value={order.fee_amount} />
    ) : (
      selectedPaymentFeeRule
    );
  const checkoutHint = getCheckoutHint({
    accountMode,
    hasIdentifier: Boolean(params.identifier),
    hasPassword,
    hasVerificationTicket,
    isEmailValid: isEmailValid.valid,
    emailMessage: isEmailValid.message,
    isReadyForPrecheck,
    isCheckingPurchaseAvailability,
    loading,
    nextAction,
    purchaseBlockReason: order?.purchase_block_reason,
    isPurchaseBlocked,
    payment: params.payment,
    paymentMethods,
    requirePassword: requiresPassword,
    verificationType,
  });

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <StepHeader
              description="填写邮箱后，系统会自动判断你是直接输入密码购买，还是先在当前页完成邮箱验证再下单。"
              index="02"
              title="创建你的账户"
            />
            <Card className="rounded-[30px] border-[#e8d8ca] bg-[linear-gradient(180deg,#fffdfa_0%,#fcf5ee_100%)] shadow-[0_24px_60px_-46px_rgba(111,78,55,0.18)] transition-shadow duration-300 hover:shadow-[0_28px_72px_-48px_rgba(111,78,55,0.24)] dark:border-[#4f3d31] dark:bg-[linear-gradient(180deg,#241b17_0%,#1b1511_100%)] dark:hover:shadow-[0_28px_72px_-48px_rgba(0,0,0,0.52)]">
              <CardHeader className="space-y-3 p-6 pb-2">
                <div className="space-y-2">
                  <div className="font-semibold text-[#2f241d] text-xl tracking-tight dark:text-[#fff4ea]">
                    {t(
                      "emailInputTitle",
                      "Enter the email address for your {{siteName}} account",
                      {
                        siteName: common.site.site_name,
                      }
                    )}
                  </div>
                  <p className="max-w-2xl text-[#756455] text-sm leading-7 dark:text-[#c7b3a2]">
                    购买成功后，你可以直接用这个邮箱登录并查看订阅状态、订单记录与使用情况。
                  </p>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 p-6 pt-4">
                <div className="flex flex-wrap gap-2">
                  <SoftHintPill
                    icon="uil:envelope-check"
                    text="邮箱作为账户标识"
                  />
                  <SoftHintPill
                    icon="uil:keyhole-circle"
                    text="老用户可直接输入密码购买"
                  />
                  <SoftHintPill
                    icon="uil:shield-check"
                    text="新邮箱可在此页验证后直接下单"
                  />
                </div>

                <div className="rounded-[26px] border border-[#ecddd0] bg-[#fffaf5] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-[#4f3d31] dark:bg-[#201815]">
                  <div className="grid gap-5">
                    <div className="flex flex-col gap-2">
                      <EnhancedInput
                        className={cn(
                          "h-12 rounded-2xl border-[#dccab9] bg-white/95 px-4 text-[0.98rem] shadow-none transition-colors duration-200 focus-visible:border-[#9b6c44] dark:border-[#5a4638] dark:bg-[#2b211b] dark:text-[#f4e7db] dark:focus-visible:border-[#c89a72]",
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
                          "text-[#8b7b6f] dark:text-[#af9886]":
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
                      <div className="grid gap-4">
                        <EnhancedInput
                          className="h-12 rounded-2xl border-[#dccab9] bg-white/95 px-4 text-[0.98rem] shadow-none transition-colors duration-200 focus-visible:border-[#9b6c44] dark:border-[#5a4638] dark:bg-[#2b211b] dark:text-[#f4e7db] dark:focus-visible:border-[#c89a72]"
                          onValueChange={(value: string) =>
                            handleChange("password", value)
                          }
                          placeholder="Password"
                          type="password"
                          value={params.password || ""}
                        />
                        <p className="text-[#8b7b6f] text-xs leading-6 dark:text-[#af9886]">
                          {getPasswordHelperText({
                            accountMode,
                            hasVerificationTicket,
                            nextAction,
                            requirePassword: requiresPassword,
                            verificationType,
                          })}
                        </p>

                        {requiresEmailVerification && (
                          <div className="rounded-[22px] border border-[#eadccf] bg-white/70 p-4 dark:border-[#4f3d31] dark:bg-[#241b17]">
                            <div className="mb-2 flex items-center gap-2 font-medium text-[#7d5a40] text-sm dark:text-[#efc7a2]">
                              <Icon
                                className="size-4"
                                icon="uil:shield-check"
                              />
                              {verificationType === "security"
                                ? "验证当前邮箱后继续购买"
                                : "验证邮箱后立即创建账号并下单"}
                            </div>
                            <p className="mb-3 text-[#8b7b6f] text-xs leading-6 dark:text-[#af9886]">
                              {verificationType === "security"
                                ? "检测到该邮箱账号尚未完成验证，请先获取验证码确认邮箱归属，再继续完成购买。"
                                : "这是首次使用该邮箱购买，请先收取验证码完成邮箱验证，之后可以直接创建订单。"}
                            </p>
                            <p className="mb-3 text-[#8b7b6f] text-xs leading-6 dark:text-[#af9886]">
                              如果收件箱里暂时找不到验证码邮件，请到垃圾邮件中查看。
                            </p>
                            <div className="flex items-center gap-2">
                              <EnhancedInput
                                className="h-12 rounded-2xl border-[#dccab9] bg-white/95 px-4 text-[0.98rem] shadow-none transition-colors duration-200 focus-visible:border-[#9b6c44] dark:border-[#5a4638] dark:bg-[#2b211b] dark:text-[#f4e7db] dark:focus-visible:border-[#c89a72]"
                                onValueChange={(value: string) => {
                                  setVerificationCode(value);
                                  if (portalVerificationTicket) {
                                    setPortalVerificationTicket("");
                                  }
                                }}
                                placeholder="输入邮箱验证码"
                                type="text"
                                value={verificationCode}
                              />
                              <Button
                                className="h-12 rounded-[20px] px-4"
                                disabled={
                                  !(params.identifier && isEmailValid.valid) ||
                                  isSendingPortalCode ||
                                  portalCodeSeconds > 0
                                }
                                onClick={handleSendPortalCode}
                                type="button"
                                variant="outline"
                              >
                                {isSendingPortalCode && (
                                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {portalCodeSeconds > 0
                                  ? `${portalCodeSeconds}s`
                                  : "发送验证码"}
                              </Button>
                              <Button
                                className="h-12 rounded-[20px] px-4"
                                disabled={
                                  !verificationCode.trim() ||
                                  isVerifyingPortalEmail
                                }
                                onClick={handleVerifyPortalEmail}
                                type="button"
                                variant={
                                  hasVerificationTicket ? "outline" : "default"
                                }
                              >
                                {isVerifyingPortalEmail && (
                                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {hasVerificationTicket
                                  ? "验证已通过"
                                  : "校验验证码"}
                              </Button>
                            </div>
                            <p
                              className={cn(
                                "mt-3 text-xs leading-6",
                                hasVerificationTicket
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-[#8b7b6f] dark:text-[#af9886]"
                              )}
                            >
                              {hasVerificationTicket
                                ? "验证码已通过，可直接继续下单。"
                                : "验证码通过后，页面会直接解锁当前邮箱的下单资格，不需要跳转注册页。"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <StepHeader
              description="确认周期、优惠券和支付通道。页面会根据当前选择实时计算本单金额。"
              index="03"
              title="确认订单，完成支付"
            />
            <Card className="rounded-[30px] border-[#e8d8ca] bg-[linear-gradient(180deg,#fffdfa_0%,#fcf5ee_100%)] shadow-[0_24px_60px_-46px_rgba(111,78,55,0.18)] transition-shadow duration-300 hover:shadow-[0_28px_72px_-48px_rgba(111,78,55,0.24)] dark:border-[#4f3d31] dark:bg-[linear-gradient(180deg,#241b17_0%,#1b1511_100%)] dark:hover:shadow-[0_28px_72px_-48px_rgba(0,0,0,0.52)]">
              <CardContent className="grid gap-8 p-6">
                <div className="rounded-[26px] border border-[#ecddd0] bg-[#fffaf5] p-5 dark:border-[#4f3d31] dark:bg-[#201815]">
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
                  <div className="rounded-[26px] border border-[#ecddd0] bg-[#fffaf5] p-5 dark:border-[#4f3d31] dark:bg-[#201815]">
                    <CouponInput
                      coupon={params.coupon}
                      onChange={(value: string) =>
                        handleChange("coupon", value)
                      }
                      status={couponStatus}
                    />
                  </div>

                  <div className="rounded-[26px] border border-[#ecddd0] bg-[#fffaf5] p-5 dark:border-[#4f3d31] dark:bg-[#201815]">
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
            <Card className="overflow-hidden rounded-[32px] border-[#dcc7b3] bg-[linear-gradient(180deg,#fffaf5_0%,#f7ede4_100%)] shadow-[0_30px_78px_-48px_rgba(111,78,55,0.28)] dark:border-[#5a4638] dark:bg-[linear-gradient(180deg,#2b211b_0%,#1b1511_100%)] dark:shadow-[0_30px_78px_-48px_rgba(0,0,0,0.58)]">
              <div className="border-[#eadccf] border-b bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))] px-6 py-5 dark:border-[#4d3b30] dark:bg-[linear-gradient(180deg,rgba(88,64,47,0.26),rgba(34,26,22,0))]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[#9b8a7b] text-xs uppercase tracking-[0.16em] dark:text-[#ad9582]">
                      Checkout Summary
                    </div>
                    <div className="mt-2 font-semibold text-[#2f241d] text-[1.55rem] tracking-tight dark:text-[#fff4ea]">
                      {subscription.name}
                    </div>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[#f4e5d8] text-[#8d6748] shadow-[0_16px_34px_-24px_rgba(111,78,55,0.35)] dark:bg-[#3a2b22] dark:text-[#efc7a2]">
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
                  <SummaryPill label="平台手续费" value={effectiveFeeDisplay} />
                  <SummaryPill
                    label="联系邮箱"
                    value={params.identifier || "待填写"}
                  />
                  <SummaryPill
                    label="优惠券"
                    value={params.coupon || "未使用"}
                  />
                </div>
                <p className="mt-4 text-[#755f4d] text-sm leading-7 dark:text-[#c7b1a0]">
                  {selectedPaymentMethod
                    ? `当前选择 ${selectedPaymentMethod.name}，${selectedPaymentFeeRule}。该费用由支付平台向用户收取，并非本站额外服务费。实际本单金额以下方订单试算为准。`
                    : "选择支付方式后，会在这里同步显示当前通道的平台手续费规则与本单试算结果。"}
                </p>
              </div>

              <CardContent className="grid gap-6 p-6">
                <div className="rounded-[24px] border border-[#eadfd3] bg-white/78 p-5 shadow-[0_16px_34px_-30px_rgba(111,78,55,0.18)] dark:border-[#4f3d31] dark:bg-[#241b17]">
                  <div className="mb-4 flex items-center gap-2 text-[#9b6c44] text-xs uppercase tracking-[0.14em] dark:text-[#efc7a2]">
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
                              "flex items-start gap-2 text-[#5f5146] text-sm leading-6 dark:text-[#d8c5b6]",
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
                      <li className="text-[#7d6b5e] text-sm leading-7 dark:text-[#c7b1a0]">
                        {parsedDescription.description ||
                          "当前套餐暂无额外说明，可直接完成购买。"}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="rounded-[24px] border border-[#eadfd3] bg-white/78 p-5 shadow-[0_16px_34px_-30px_rgba(111,78,55,0.18)] dark:border-[#4f3d31] dark:bg-[#241b17]">
                  <SubscribeDetail
                    subscribe={{
                      ...subscription,
                      quantity: params.quantity,
                    }}
                  />
                </div>

                <div className="rounded-[24px] border border-[#eadfd3] bg-white/78 p-5 shadow-[0_16px_34px_-30px_rgba(111,78,55,0.18)] dark:border-[#4f3d31] dark:bg-[#241b17]">
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

                <div className="rounded-[22px] border border-[#e7d6c6] bg-white/65 px-4 py-3 text-[#6d5848] text-sm leading-6 dark:border-[#4f3d31] dark:bg-[#221915] dark:text-[#c9b4a2]">
                  订单总额会自动包含当前支付通道的平台手续费。该费用由支付平台向用户收取，不属于站点额外服务费。
                </div>

                <Separator className="bg-[#eadccf] dark:bg-[#4a392e]" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[#8b7b6f] text-sm dark:text-[#aa9482]">
                      {t("billing.total", "Total")}
                    </div>
                    <div className="font-semibold text-[#2f241d] text-[2rem] tracking-tight dark:text-[#fff4ea]">
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
                  <div className="max-w-[360px] flex-1">
                    <div
                      className={cn(
                        "mb-3 rounded-[20px] border px-4 py-3 text-sm leading-6 shadow-[0_14px_30px_-28px_rgba(111,78,55,0.24)]",
                        checkoutHint.tone === "success"
                          ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300"
                          : "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className="mt-0.5 size-4 shrink-0"
                          icon={
                            checkoutHint.tone === "success"
                              ? "uil:check-circle"
                              : "uil:exclamation-circle"
                          }
                        />
                        <div>
                          <div className="font-medium">
                            {checkoutHint.title}
                          </div>
                          <p className="mt-1 opacity-90">
                            {checkoutHint.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="hover:-translate-y-0.5 h-12 w-full rounded-2xl bg-[linear-gradient(180deg,#7d5a40_0%,#65472f_100%)] px-6 text-white shadow-[0_18px_40px_-24px_rgba(111,78,55,0.55)] transition-all duration-300 hover:brightness-105"
                      disabled={!canSubmitPurchase}
                      onClick={handleSubmit}
                      size="lg"
                    >
                      {loading && (
                        <LoaderCircle className="mr-2 animate-spin" />
                      )}
                      {t("buyNow", "Buy Now")}
                    </Button>
                  </div>
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
        <div className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(180deg,#9b6c44_0%,#7a5538_100%)] font-semibold text-sm text-white shadow-[0_14px_28px_-18px_rgba(111,78,55,0.8)]">
          {index}
        </div>
        <h2 className="font-semibold text-[#2f241d] text-[1.45rem] tracking-tight dark:text-white">
          {title}
        </h2>
      </div>
      <p className="text-[#756455] text-sm leading-7 dark:text-[#c7b1a0]">
        {description}
      </p>
    </div>
  );
}

function SoftHintPill({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="hover:-translate-y-0.5 inline-flex items-center gap-2 rounded-full border border-[#e3d3c4] bg-[#fffaf5] px-3 py-1.5 text-[#6f5846] text-xs shadow-[0_10px_26px_-24px_rgba(111,78,55,0.3)] transition-transform duration-300 dark:border-[#554133] dark:bg-[#2a201a]/88 dark:text-[#d9c3b1]">
      <div className="flex items-center gap-2">
        <Icon className="size-4" icon={icon} />
        <span>{text}</span>
      </div>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="hover:-translate-y-0.5 rounded-[20px] border border-[#e9dbcf] bg-white/78 px-4 py-3 shadow-[0_14px_30px_-28px_rgba(111,78,55,0.25)] transition-transform duration-300 dark:border-[#4f3d31] dark:bg-[#241b17]">
      <div className="text-[#9b8a7b] text-[11px] uppercase tracking-[0.14em] dark:text-[#aa9482]">
        {label}
      </div>
      <div className="mt-1 truncate font-medium text-[#2f241d] text-sm dark:text-[#f5e8db]">
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

function formatPaymentFeeRule(
  method: API.PaymentMethod,
  currencySymbol: string
) {
  if (method.fee_mode === 1) {
    return `平台手续费 ${method.fee_percent}%`;
  }

  if (method.fee_mode === 2) {
    return `平台手续费 ${currencySymbol}${(method.fee_amount / 100).toFixed(2)}`;
  }

  return "平台免手续费";
}

function getCheckoutHint({
  accountMode,
  hasIdentifier,
  hasPassword,
  hasVerificationTicket,
  isEmailValid,
  emailMessage,
  isReadyForPrecheck,
  isCheckingPurchaseAvailability,
  loading,
  nextAction,
  purchaseBlockReason,
  isPurchaseBlocked,
  payment,
  paymentMethods,
  requirePassword,
  verificationType,
}: {
  accountMode: string;
  hasIdentifier: boolean;
  hasPassword: boolean;
  hasVerificationTicket: boolean;
  isEmailValid: boolean;
  emailMessage?: string;
  isReadyForPrecheck: boolean;
  isCheckingPurchaseAvailability: boolean;
  loading: boolean;
  nextAction: string;
  purchaseBlockReason?: string;
  isPurchaseBlocked: boolean;
  payment: number;
  paymentMethods: API.PaymentMethod[];
  requirePassword: boolean;
  verificationType: string;
}) {
  if (loading) {
    return {
      description: "订单正在创建中，请稍候，成功后会自动跳转到支付页。",
      title: "正在为你生成订单",
      tone: "success" as const,
    };
  }

  if (!hasIdentifier) {
    return {
      description:
        "先填写一个可用邮箱，系统会用它创建账户并同步本次购买记录，按钮随后会自动变为可点击。",
      title: "按钮未点亮：先填写邮箱",
      tone: "warning" as const,
    };
  }

  if (!isEmailValid) {
    return {
      description: emailMessage || "请改成有效邮箱地址后再继续购买。",
      title: "按钮未点亮：邮箱还没有通过校验",
      tone: "warning" as const,
    };
  }

  if (paymentMethods.length === 0) {
    return {
      description:
        "当前站点还没有启用可用的在线支付通道，所以暂时无法继续购买。启用外部支付后，这里会自动恢复可下单状态。",
      title: "按钮未点亮：当前暂无可用支付方式",
      tone: "warning" as const,
    };
  }

  if (!paymentMethods.some((method) => String(method.id) === String(payment))) {
    return {
      description: "选择一个支付方式后，页面会同步试算实际支付金额。",
      title: "下一步：请选择支付方式",
      tone: "warning" as const,
    };
  }

  if (!isReadyForPrecheck) {
    return {
      description:
        "填写可用邮箱并选择支付方式后，系统会自动判断你是直接输入密码购买，还是先完成邮箱验证。",
      title: "下一步：完善购买信息",
      tone: "warning" as const,
    };
  }

  if (isCheckingPurchaseAvailability) {
    return {
      description: "正在根据当前邮箱、密码和支付方式检查是否可以直接创建订单。",
      title: "正在检查购买资格",
      tone: "warning" as const,
    };
  }

  if (nextAction === "input_password") {
    return hasPassword
      ? {
          description:
            purchaseBlockReason || "当前密码校验未通过，请重新输入后再试。",
          title: "请检查账号密码",
          tone: "warning" as const,
        }
      : {
          description:
            purchaseBlockReason ||
            "检测到这是已注册账户，请输入密码后继续购买。",
          title: "下一步：请输入密码",
          tone: "warning" as const,
        };
  }

  if (nextAction === "verify_email") {
    if (!hasVerificationTicket) {
      return {
        description:
          purchaseBlockReason ||
          getVerificationPrompt({ accountMode, verificationType }),
        title: "下一步：请先完成邮箱验证",
        tone: "warning" as const,
      };
    }

    if (requirePassword && !hasPassword) {
      return {
        description:
          verificationType === "security"
            ? "邮箱验证已经通过，再确认当前账号密码后即可提交订单。"
            : "邮箱验证已经通过，再设置一个登录密码后即可直接下单。",
        title: "验证码已通过，请补充密码",
        tone: "warning" as const,
      };
    }

    return {
      description:
        "邮箱验证码已通过，当前页已经具备下单所需信息，可以直接提交订单并进入支付流程。",
      title: "验证码已通过，可直接下单",
      tone: "success" as const,
    };
  }

  if (isPurchaseBlocked) {
    return {
      description:
        purchaseBlockReason ||
        "当前条件下暂时无法直接创建订单，请先按提示完成处理。",
      title: "暂时无法提交订单",
      tone: "warning" as const,
    };
  }

  return {
    description: "信息已填写完成，可以直接提交订单并进入支付流程。",
    title: "已准备就绪，可以立即购买",
    tone: "success" as const,
  };
}

function getPasswordHelperText({
  accountMode,
  nextAction,
  verificationType,
  hasVerificationTicket,
  requirePassword,
}: {
  accountMode: string;
  nextAction: string;
  verificationType: string;
  hasVerificationTicket: boolean;
  requirePassword: boolean;
}) {
  if (nextAction === "input_password") {
    return "检测到这是已注册账户，请输入当前登录密码后继续购买。";
  }

  if (nextAction === "verify_email") {
    if (!requirePassword) {
      return "当前邮箱需要先完成验证码验证，通过后就可以继续购买。";
    }

    if (hasVerificationTicket) {
      return verificationType === "security"
        ? "邮箱验证已通过，请确认当前账号密码后继续购买。"
        : "邮箱验证已通过，请设置一个登录密码后继续购买。";
    }

    return getVerificationPrompt({ accountMode, verificationType });
  }

  return "如果这是你的已有账号，请输入密码；如果是首次使用，也可以在当前页面完成邮箱验证后直接购买。";
}

function getVerificationPrompt({
  accountMode,
  verificationType,
}: {
  accountMode: string;
  verificationType: string;
}) {
  if (
    verificationType === "security" ||
    accountMode === "existing_unverified"
  ) {
    return "该邮箱账号尚未完成验证，请先收取验证码并验证邮箱，再确认密码完成购买。";
  }

  return "这是首次使用该邮箱购买，请先收取验证码完成邮箱验证，并设置登录密码。";
}
