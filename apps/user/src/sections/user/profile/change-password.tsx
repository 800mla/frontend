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
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { updateUserPassword } from "@workspace/ui/services/user/user";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

export default function ChangePassword() {
  const { t } = useTranslation("profile");
  const FormSchema = z
    .object({
      password: z.string().min(6),
      repeat_password: z.string(),
    })
    .refine((data) => data.password === data.repeat_password, {
      message: t("accountSettings.passwordMismatch", "Passwords do not match"),
      path: ["repeat_password"],
    });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    await updateUserPassword({ password: data.password });
    toast.success(t("accountSettings.updateSuccess", "Update Successful"));
    form.reset();
  }

  return (
    <Card className="border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,246,243,0.93))] shadow-[0_22px_56px_-48px_rgba(45,35,27,0.16)] dark:border-[#2f2620] dark:bg-[linear-gradient(180deg,rgba(28,23,20,0.98),rgba(21,18,16,0.96))]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit items-center rounded-full border border-primary/15 bg-primary/6 px-3 py-1 text-primary text-xs uppercase tracking-[0.16em]">
          Security
        </div>
        <CardTitle className="text-xl tracking-tight">
          {t("accountSettings.accountSettings", "Password Settings")}
        </CardTitle>
        <CardDescription className="text-sm leading-7">
          更新登录密码，保持账户安全。这里不做花哨装饰，只保留最直接的操作。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            id="password-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="h-11 rounded-2xl bg-background/75"
                      placeholder={t(
                        "accountSettings.newPassword",
                        "New Password"
                      )}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repeat_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="h-11 rounded-2xl bg-background/75"
                      placeholder={t(
                        "accountSettings.repeatNewPassword",
                        "Repeat New Password"
                      )}
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full sm:w-auto" type="submit">
              {t("accountSettings.updatePassword", "Update Password")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
