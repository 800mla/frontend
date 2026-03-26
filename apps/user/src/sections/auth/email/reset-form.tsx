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

export default function ResetForm({
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
  const { verify, auth } = common;

  const formSchema = z.object({
    email: z
      .string()
      .email(t("reset.email", "Please enter a valid email address")),
    password: z.string(),
    code: auth?.email?.enable_verify ? z.string() : z.string().nullish(),
    cf_token:
      verify.enable_register_verify && verify.turnstile_site_key
        ? z.string()
        : z.string().nullish(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
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
      <Form {...form}>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="用于确认你要找回的是哪一个账户。"
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
            name="code"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="验证码用于确认是你本人发起找回。"
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
                      className="h-12 rounded-[20px] px-4"
                      params={{
                        email: form.watch("email"),
                        type: 2,
                      }}
                      size="default"
                      type="email"
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
                  description="设置一个新的口令，原有旧口令将自动失效。"
                  icon="uil:key-skeleton"
                  title="新口令"
                />
                <FormControl>
                  <Input
                    className={authInputClassName}
                    placeholder="输入新的登录口令"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="pl-1 text-xs" />
              </FormItem>
            )}
          />
          {verify.enable_reset_password_verify && (
            <FormField
              control={form.control}
              name="cf_token"
              render={({ field }) => (
                <FormItem className={authSoftPanelClassName}>
                  <FormLabel className="font-semibold text-foreground text-sm">
                    安全校验
                  </FormLabel>
                  <FormDescription className="text-muted-foreground text-xs leading-5">
                    再做一次校验，避免密码找回入口被异常滥用。
                  </FormDescription>
                  <FormControl>
                    <CloudFlareTurnstile
                      id="reset"
                      {...field}
                      ref={turnstile}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          )}
          <Button
            className={authSubmitButtonClassName}
            disabled={loading}
            type="submit"
          >
            {loading && <Icon className="animate-spin" icon="mdi:loading" />}
            {t("reset.title", "Reset Password")}
          </Button>
        </form>
      </Form>
      <div className="mt-5 flex items-center justify-end rounded-[22px] border border-border/55 bg-muted/12 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        {t("reset.existingAccount", "Remember your password?")}&nbsp;
        <Button
          className={authLinkButtonClassName}
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm("login");
          }}
          variant="link"
        >
          {t("reset.switchToLogin", "Login")}
        </Button>
      </div>
    </>
  );
}
