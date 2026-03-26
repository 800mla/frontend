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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@workspace/ui/components/form";
import { Switch } from "@workspace/ui/components/switch";
import { updateUserNotify } from "@workspace/ui/services/user/user";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { useGlobalStore } from "@/stores/global";

const FormSchema = z.object({
  enable_balance_notify: z.boolean(),
  enable_login_notify: z.boolean(),
  enable_subscribe_notify: z.boolean(),
  enable_trade_notify: z.boolean(),
});

export default function NotifySettings() {
  const { t } = useTranslation("profile");
  const { user, getUserInfo } = useGlobalStore();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      enable_balance_notify: user?.enable_balance_notify ?? false,
      enable_login_notify: user?.enable_login_notify ?? false,
      enable_subscribe_notify: user?.enable_subscribe_notify ?? false,
      enable_trade_notify: user?.enable_trade_notify ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      enable_balance_notify: user?.enable_balance_notify ?? false,
      enable_login_notify: user?.enable_login_notify ?? false,
      enable_subscribe_notify: user?.enable_subscribe_notify ?? false,
      enable_trade_notify: user?.enable_trade_notify ?? false,
    });
  }, [form, user]);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateUserNotify(data);
    toast.success(t("notify.updateSuccess", "Update Successful"));
    await getUserInfo();
  }

  return (
    <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,243,0.93))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:border-[#2f2620] dark:bg-[linear-gradient(180deg,rgba(28,23,20,0.98),rgba(21,18,16,0.96))]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
          Notification
        </div>
        <CardTitle className="text-xl tracking-tight">
          {t("notify.notificationSettings", "Notification Settings")}
        </CardTitle>
        <CardDescription className="text-sm leading-7">
          选择希望接收的提醒类型。我们把选项做得更平铺，让你一眼能看清每个开关。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Form {...form}>
          <form
            className="space-y-4"
            id="notify-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="space-y-4">
              {[
                {
                  name: "enable_balance_notify",
                  label: t("notify.balanceChange", "Balance Change"),
                },
                {
                  name: "enable_login_notify",
                  label: t("notify.login", "Login"),
                },
                {
                  name: "enable_subscribe_notify",
                  label: t("notify.subscribe", "Subscribe"),
                },
                {
                  name: "enable_trade_notify",
                  label: t("notify.finance", "Finance"),
                },
              ].map(({ name, label }) => (
                <FormField
                  control={form.control}
                  key={name}
                  name={name as keyof z.infer<typeof FormSchema>}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-[20px] border border-border/45 bg-background/75 px-4 py-4">
                      <FormLabel className="text-foreground text-sm">
                        {label}
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button className="w-full sm:w-auto" type="submit">
              {t("notify.save", "Save Changes")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
