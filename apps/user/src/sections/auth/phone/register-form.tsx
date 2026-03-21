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
import { AreaCodeSelect } from "@workspace/ui/composed/area-code-select";
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
  onSwitchForm,
}: {
  loading?: boolean;
  onSubmit: (data: any) => void;
  initialValues: any;
  onSwitchForm: Dispatch<SetStateAction<"register" | "reset" | "login">>;
}) {
  const { t } = useTranslation("auth");
  const { common } = useGlobalStore();
  const { verify, auth, invite } = common;
  const { enable_whitelist, whitelist } = auth.mobile;

  const formSchema = z
    .object({
      telephone_area_code: z.string(),
      telephone: z.string(),
      password: z.string(),
      repeat_password: z.string(),
      code: z.string(),
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
      telephone_area_code: initialValues?.telephone_area_code || "1",
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
        <div className={authSoftPanelClassName}>
          <Markdown>
            {t("register.message", "Registration is currently disabled")}
          </Markdown>
        </div>
      ) : (
        <Form {...form}>
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="telephone"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="注册时将使用该号码完成验证与后续安全确认。"
                    icon="uil:mobile-android"
                    title="手机号"
                  />
                  <FormControl>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="telephone_area_code"
                        render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <AreaCodeSelect
                              className="h-12 w-32 rounded-[20px] border-border/60 bg-background/80 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
                              onChange={(value) => {
                                if (value.phone) {
                                  form.setValue(
                                      "telephone_area_code",
                                      value.phone
                                    );
                                  }
                                }}
                                placeholder="Area code..."
                                simple
                                value={field.value}
                                whitelist={enable_whitelist ? whitelist : []}
                              />
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Input
                      className={authInputClassName}
                      placeholder="输入手机号"
                      type="tel"
                      {...field}
                    />
                  </div>
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
                    description="设置用于登录与设备授权的主口令。"
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
                    description="重复一次口令，帮助确认输入无误。"
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
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="验证码会发送至当前手机号，用于完成注册验证。"
                    icon="uil:message"
                    title="短信验证"
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
                          telephone: form.watch("telephone"),
                          telephone_area_code: form.watch(
                            "telephone_area_code"
                          ),
                          type: 1,
                        }}
                        className="h-12 rounded-[20px] px-4"
                        size="default"
                        type="phone"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="pl-1 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="invite"
              render={({ field }) => (
                <FormItem className="gap-2.5">
                  <AuthFieldHeading
                    description="如由朋友邀请或活动获取，可在此填写邀请码。"
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
                      完成校验后即可建立新账户，减少异常注册流量。
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
            // setInitialValues(undefined);
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
