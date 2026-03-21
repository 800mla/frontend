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
import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";
import SendCode from "../send-code";
import type { TurnstileRef } from "../turnstile";
import CloudFlareTurnstile from "../turnstile";
import {
  AuthFieldHeading,
  authInlineToggleButtonClassName,
  authInputClassName,
  authLinkButtonClassName,
  authSoftPanelClassName,
  authSubmitButtonClassName,
} from "../ui";

export default function LoginForm({
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
  const { verify } = common;

  const formSchema = z.object({
    telephone_area_code: z.string(),
    telephone: z.string(),
    telephone_code: z.string().optional(),
    password: z.string().optional(),
    cf_token:
      verify.enable_login_verify && verify.turnstile_site_key
        ? z.string()
        : z.string().optional(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const [mode, setMode] = useState<"password" | "code">("password");

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
            name="telephone"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="支持密码登录与短信验证码登录两种模式。"
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
            name={mode === "code" ? "telephone_code" : "password"}
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  action={
                    <Button
                      className={authInlineToggleButtonClassName}
                      onClick={(e) => {
                        e.preventDefault();
                        setMode(mode === "password" ? "code" : "password");
                      }}
                      variant="link"
                    >
                      {mode === "password"
                        ? t("login.codeLogin", "Login with Code")
                        : t("login.passwordLogin", "Login with Password")}
                    </Button>
                  }
                  description={
                    mode === "code"
                      ? "短信验证码更适合快速登录。"
                      : "密码模式适合常规登录与多设备使用。"
                  }
                  icon={mode === "code" ? "uil:message" : "uil:lock-alt"}
                  title={mode === "code" ? "短信验证" : "账户口令"}
                />
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      className={authInputClassName}
                      placeholder={
                        mode === "code" ? "输入短信验证码" : "输入登录口令"
                      }
                      type={mode === "code" ? "text" : "password"}
                      {...field}
                    />
                    {mode === "code" && (
                      <SendCode
                        params={{
                          telephone: form.watch("telephone"),
                          telephone_area_code: form.watch(
                            "telephone_area_code"
                          ),
                          type: 2,
                        }}
                        className="h-12 rounded-[20px] px-4"
                        size="default"
                        type="phone"
                      />
                    )}
                  </div>
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
                    完成安全验证后即可继续手机号登录。
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
            // setInitialValues(undefined);
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
