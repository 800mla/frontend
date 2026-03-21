import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Icon } from "@workspace/ui/composed/icon";
import { Markdown } from "@workspace/ui/composed/markdown";
import type { Dispatch, SetStateAction } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";
import SendCode from "../send-code";
import type { TurnstileRef } from "../turnstile";
import CloudFlareTurnstile from "../turnstile";
import {
  AuthFieldHeading,
  authInputClassName,
  authLinkButtonClassName,
  authSoftPanelClassName,
  authSubmitButtonClassName,
} from "../ui";

export default function RegisterForm({
  loading,
  onSubmit,
  initialValues,
  setInitialValues,
  onSwitchForm,
}: {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  setInitialValues: Dispatch<SetStateAction<any>>;
  onSwitchForm: Dispatch<SetStateAction<"register" | "reset" | "login">>;
}) {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { verify, auth, invite } = common;

  const handleCheckUser = async (email: string) => {
    try {
      if (!auth.email.enable_domain_suffix) return true;
      const domain = email.split("@")[1];
      const isValid = auth.email?.domain_suffix_list
        .split("\n")
        .includes(domain || "");
      return isValid;
    } catch (error) {
      console.log("Error checking user:", error);
      return false;
    }
  };

  const formSchema = z
    .object({
      email: z
        .string()
        .email(t("register.email", "Please enter a valid email address"))
        .refine(handleCheckUser, {
          message: t(
            "register.whitelist",
            "This email domain is not in the whitelist"
          ),
        }),
      password: z.string(),
      repeat_password: z.string(),
      code: auth.email.enable_verify ? z.string() : z.string().nullish(),
      invite: invite.forced_invite ? z.string().min(1) : z.string().nullish(),
      cf_token:
        verify.enable_register_verify && verify.turnstile_site_key
          ? z.string()
          : z.string().nullish(),
    })
    .superRefine(({ password, repeat_password }, ctx) => {
      if (password !== repeat_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("register.passwordMismatch", "Passwords do not match"),
          path: ["repeat_password"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialValues,
      invite: localStorage.getItem("invite") || "",
    },
  });

  const turnstile = useRef<TurnstileRef>(null);
  const handleSubmit = form.handleSubmit((data) => {
    try {
      onSubmit(data);
    } catch (_error) {
      turnstile.current?.reset();
    }
  });

  return (
    <>
      {auth.register.stop_register ? (
        <Markdown className={authSoftPanelClassName}>
          {t("register.message", "Registration is currently disabled")}
        </Markdown>
      ) : (
        <Form {...form}>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="用于接收验证邮件与后续服务提醒。"
                    icon="uil:envelope"
                    title="邮箱地址"
                  />
                  <FormControl>
                    <Input
                      className={authInputClassName}
                      placeholder="name@bingka.org"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pl-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="建议至少使用 8 位以上组合，兼顾记忆与安全。"
                    icon="uil:lock-alt"
                    title="设置口令"
                  />
                  <FormControl>
                    <Input
                      className={authInputClassName}
                      placeholder="设置新的登录口令"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pl-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="再次确认口令，避免首次录入时出现误差。"
                    icon="uil:check-circle"
                    title="确认口令"
                  />
                  <FormControl>
                    <Input
                      className={authInputClassName}
                      disabled={loading}
                      placeholder="再次输入口令"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pl-1 text-xs" />
                </FormItem>
              )}
            />
            {auth.email.enable_verify && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="gap-2.5">
                    <AuthFieldHeading
                      description="验证码会发送到上方邮箱，请在有效时间内完成填写。"
                      icon="uil:message"
                      title="邮箱验证"
                    />
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          className={authInputClassName}
                          disabled={loading}
                          placeholder="输入验证码"
                          type="text"
                          {...field}
                          value={field.value as string}
                        />
                        <SendCode
                          params={{
                            email: form.watch("email"),
                            type: 1,
                          }}
                          className="h-12 rounded-[20px] px-4"
                          size="default"
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="pl-1 text-xs" />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="invite"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="如由朋友分享或活动发放，可在这里填写邀请码。"
                    icon="uil:ticket"
                    title="邀请码"
                  />
                  <FormControl>
                    <Input
                      className={authInputClassName}
                      disabled={loading || !!localStorage.getItem("invite")}
                      placeholder={t(
                        "register.invite",
                        "Invitation Code (Optional)"
                      )}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage className="pl-1 text-xs" />
                </FormItem>
              )}
            />
            {verify.enable_register_verify && (
              <FormField
                control={form.control}
                name="cf_token"
                render={({ field }) => (
                  <FormItem className={authSoftPanelClassName}>
                    <FormLabel className="text-sm font-semibold text-foreground">
                      安全校验
                    </FormLabel>
                    <FormDescription className="text-xs leading-5 text-muted-foreground">
                      完成验证后即可创建账户，帮助降低异常注册请求。
                    </FormDescription>
                    <FormControl>
                      <CloudFlareTurnstile
                        id="register"
                        {...field}
                        ref={turnstile}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}
            <Button className={authSubmitButtonClassName} disabled={loading} type="submit">
              {loading && <Icon className="animate-spin" icon="mdi:loading" />}
              {t("register.title", "Register")}
            </Button>
          </form>
        </Form>
      )}
      <div className="mt-5 flex items-center justify-end rounded-[22px] border border-border/55 bg-muted/12 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        {t("register.existingAccount", "Already have an account?")}&nbsp;
        <Button
          className={authLinkButtonClassName}
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm("login");
          }}
          variant="link"
        >
          {t("register.switchToLogin", "Login")}
        </Button>
      </div>
    </>
  );
}
