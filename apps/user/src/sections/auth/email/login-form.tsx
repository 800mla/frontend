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
import type { TurnstileRef } from "../turnstile";
import CloudFlareTurnstile from "../turnstile";
import {
  AuthFieldHeading,
  authInputClassName,
  authLinkButtonClassName,
  authSoftPanelClassName,
  authSubmitButtonClassName,
} from "../ui";

export default function LoginForm({
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
  const { verify } = common;

  const formSchema = z.object({
    email: z.email(t("login.email", "Please enter a valid email address")),
    password: z.string(),
    cf_token:
      verify.enable_login_verify && verify.turnstile_site_key
        ? z.string()
        : z.string().optional(),
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
                  description="用于接收通知、账单与安全提醒。"
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
                  description="建议使用你常用的登录口令，支持后续自主修改。"
                  icon="uil:lock-alt"
                  title="账户口令"
                />
                <FormControl>
                  <Input
                    className={authInputClassName}
                    placeholder="输入你的登录口令"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="pl-1 text-xs" />
              </FormItem>
            )}
          />
          {verify.enable_login_verify && (
            <FormField
              control={form.control}
              name="cf_token"
              render={({ field }) => (
                <FormItem className={authSoftPanelClassName}>
                  <FormLabel className="text-sm font-semibold text-foreground">
                    安全校验
                  </FormLabel>
                  <FormDescription className="text-xs leading-5 text-muted-foreground">
                    完成验证后再继续登录，可减少异常请求干扰。
                  </FormDescription>
                  <FormControl>
                    <CloudFlareTurnstile
                      id="login"
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
            {t("login.title", "Login")}
          </Button>
        </form>
      </Form>
      <div className="mt-5 flex w-full items-center justify-between rounded-[22px] border border-border/55 bg-muted/12 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
        <Button
          className={authLinkButtonClassName}
          onClick={() => onSwitchForm("reset")}
          type="button"
          variant="link"
        >
          {t("login.forgotPassword", "Forgot Password?")}
        </Button>
        <Button
          className={authLinkButtonClassName}
          onClick={() => {
            setInitialValues(undefined);
            onSwitchForm("register");
          }}
          variant="link"
        >
          {t("login.registerAccount", "Register Account")}
        </Button>
      </div>
    </>
  );
}
