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
    telephone_area_code: z.string(),
    telephone: z.string(),
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
            name="telephone"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="先确认手机号，再完成验证码与新口令设置。"
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
            name="code"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="短信验证码用于确认当前操作由你本人发起。"
                  icon="uil:message"
                  title="短信验证"
                />
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      className={authInputClassName}
                      placeholder="输入验证码"
                      type="text"
                      {...field}
                      value={field.value as string}
                    />
                    <SendCode
                      className="h-12 rounded-[20px] px-4"
                      params={{
                        telephone: form.watch("telephone"),
                        telephone_area_code: form.watch("telephone_area_code"),
                        type: 2,
                      }}
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
            name="password"
            render={({ field }) => (
              <FormItem className="gap-2.5">
                <AuthFieldHeading
                  description="新的口令将在修改成功后立刻生效。"
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
                    完成校验后即可提交找回请求，保护密码修改流程。
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
