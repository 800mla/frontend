"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { AreaCodeSelect } from "@workspace/ui/composed/area-code-select";
import { Icon } from "@workspace/ui/composed/icon";
import { cn } from "@workspace/ui/lib/utils";
import {
  bindOAuth,
  unbindOAuth,
  updateBindEmail,
  updateBindMobile,
} from "@workspace/ui/services/user/user";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import SendCode from "@/sections/auth/send-code";
import { useGlobalStore } from "@/stores/global";

function MobileBindDialog({
  onSuccess,
  children,
}: {
  onSuccess: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTranslation("profile");
  const { common } = useGlobalStore();
  const { enable_whitelist, whitelist } = common.auth.mobile;
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    area_code: z.string().min(1, "Area code is required"),
    mobile: z.string().min(5, "Phone number is required"),
    code: z.string().min(4, "Verification code is required"),
  });

  type MobileBindFormValues = z.infer<typeof formSchema>;

  const form = useForm<MobileBindFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area_code: "1",
      mobile: "",
      code: "",
    },
  });

  const onSubmit = async (values: MobileBindFormValues) => {
    try {
      await updateBindMobile(values);
      toast.success(t("thirdParty.bindSuccess", "Successfully connected"));
      onSuccess();
      setOpen(false);
    } catch (_error) {
      toast.error(t("thirdParty.bindFailed", "Failed to connect"));
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("thirdParty.bindMobile", "Connect Mobile")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex">
                      <FormField
                        control={form.control}
                        name="area_code"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <AreaCodeSelect
                                className="w-32 rounded-r-none border-r-0"
                                onChange={(value) => {
                                  if (value.phone) {
                                    form.setValue(field.name, value.phone);
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
                        className="rounded-l-none"
                        placeholder="Enter your telephone..."
                        type="tel"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code..."
                        type="text"
                        {...field}
                      />
                      <SendCode
                        params={{
                          telephone_area_code: form.watch("area_code"),
                          telephone: form.watch("mobile"),
                          type: 1,
                        }}
                        type="phone"
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              {t("thirdParty.confirm", "Confirm")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function ThirdPartyAccounts() {
  const { t } = useTranslation("profile");
  const { user, getUserInfo, common } = useGlobalStore();
  const { oauth_methods } = common;

  const accounts = [
    {
      id: "email",
      icon: "logos:mailgun-icon",
      name: "Email",
      type: "Basic",
      descriptionDefault: "Link your email address",
    },
    {
      id: "mobile",
      icon: "mdi:telephone",
      name: "Mobile",
      type: "Basic",
      descriptionDefault: "Link your mobile number",
    },
    {
      id: "telegram",
      icon: "logos:telegram",
      name: "Telegram",
      type: "OAuth",
      descriptionDefault: "Sign in with Telegram",
    },
    {
      id: "apple",
      icon: "uil:apple",
      name: "Apple",
      type: "OAuth",
      descriptionDefault: "Sign in with Apple",
    },
    {
      id: "google",
      icon: "logos:google",
      name: "Google",
      type: "OAuth",
      descriptionDefault: "Sign in with Google",
    },
    {
      id: "facebook",
      icon: "logos:facebook",
      name: "Facebook",
      type: "OAuth",
      descriptionDefault: "Sign in with Facebook",
    },
    {
      id: "github",
      icon: "uil:github",
      name: "GitHub",
      type: "OAuth",
      descriptionDefault: "Sign in with GitHub",
    },
    {
      id: "device",
      icon: "mdi:devices",
      name: "Device",
      type: "OAuth",
      descriptionDefault: "Sign in with Device ID",
    },
  ].filter((account) => {
    if (account.id === "email") return common.auth.email.enable;
    if (account.id === "mobile") return common.auth.mobile.enable;
    return oauth_methods?.includes(account.id);
  });

  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const handleBasicAccountUpdate = async (
    account: (typeof accounts)[0],
    value: string
  ) => {
    if (account.id === "email") {
      await updateBindEmail({ email: value });
      await getUserInfo();
      toast.success(t("thirdParty.updateSuccess", "Update Successful"));
    }
  };

  const handleAccountAction = async (account: (typeof accounts)[number]) => {
    const isBound = user?.auth_methods?.find(
      (auth) => auth.auth_type === account.id
    )?.auth_identifier;
    if (isBound) {
      await unbindOAuth({ method: account.id });
      await getUserInfo();
    } else {
      const res = await bindOAuth({
        method: account.id,
        redirect: `${window.location.origin}/bind/${account.id}`,
      });
      if (res.data?.data?.redirect) {
        window.location.href = res.data.data.redirect;
      }
    }
  };

  return (
    <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,243,0.93))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:border-[#2f2620] dark:bg-[linear-gradient(180deg,rgba(28,23,20,0.98),rgba(21,18,16,0.96))]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
          Connected
        </div>
        <CardTitle className="text-xl tracking-tight">
          {t("thirdParty.title", "Connected Accounts")}
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-7">
          把登录方式集中管理。邮箱和手机号适合做基础绑定，第三方账号更适合补充快捷登录。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {accounts.length === 0 && (
            <div className="rounded-[24px] border border-border/55 border-dashed bg-background/70 px-5 py-8 text-center text-muted-foreground text-sm leading-7">
              当前没有可配置的绑定方式，等后端开放对应登录方式后会自动显示在这里。
            </div>
          )}
          {accounts.map((account) => {
            const method = user?.auth_methods?.find(
              (auth) => auth.auth_type === account.id
            );
            const isEditing = account.id === "email";
            const currentValue =
              editValues[account.id] ?? method?.auth_identifier ?? "";
            let displayValue = "";

            switch (account.id) {
              case "email":
                displayValue = isEditing
                  ? currentValue
                  : method?.auth_identifier || "";
                break;
              default:
                displayValue =
                  method?.auth_identifier ||
                  t(
                    `thirdParty.${account.id}.description`,
                    account.descriptionDefault
                  );
            }

            return (
              <div
                className="rounded-[24px] border border-border/55 bg-background/78 p-4 shadow-[0_18px_44px_-40px_rgba(42,32,24,0.12)]"
                key={account.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-background shadow-sm">
                      <Icon className="size-6" icon={account.icon} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {account.name}
                        </span>
                        <span className="rounded-full border border-border/50 bg-background/75 px-2.5 py-0.5 text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
                          {account.type}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[11px]",
                            method?.auth_identifier
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {method?.auth_identifier ? "已连接" : "未连接"}
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground text-sm leading-7">
                        {t(
                          `thirdParty.${account.id}.description`,
                          account.descriptionDefault
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:max-w-[360px]">
                    <Input
                      className="h-11 rounded-2xl bg-background/80"
                      disabled={!isEditing}
                      onChange={(e) =>
                        isEditing &&
                        setEditValues((prev) => ({
                          ...prev,
                          [account.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isEditing) {
                          handleBasicAccountUpdate(account, currentValue);
                        }
                      }}
                      value={displayValue}
                    />
                    {account.id === "mobile" ? (
                      <MobileBindDialog onSuccess={getUserInfo}>
                        <Button
                          className="w-full whitespace-nowrap"
                          variant={
                            method?.auth_identifier ? "outline" : "default"
                          }
                        >
                          {t(
                            method?.auth_identifier
                              ? "thirdParty.update"
                              : "thirdParty.bind",
                            method?.auth_identifier ? "Update" : "Connect"
                          )}
                        </Button>
                      </MobileBindDialog>
                    ) : (
                      <Button
                        className="w-full whitespace-nowrap"
                        onClick={() =>
                          isEditing
                            ? handleBasicAccountUpdate(account, currentValue)
                            : handleAccountAction(account)
                        }
                        variant={
                          method?.auth_identifier ? "outline" : "default"
                        }
                      >
                        {t(
                          isEditing
                            ? "thirdParty.save"
                            : method?.auth_identifier
                              ? "thirdParty.unbind"
                              : "thirdParty.bind",
                          isEditing
                            ? "Save"
                            : method?.auth_identifier
                              ? "Disconnect"
                              : "Connect"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
