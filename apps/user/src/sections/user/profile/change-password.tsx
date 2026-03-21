"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
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
    <Card className="min-w-80 border-border/60 bg-gradient-to-br from-card to-card/40 shadow-md backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg">
      <CardHeader className="gap-4">
        <CardTitle className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 font-serif text-xl font-medium tracking-wide">
            <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
              🔐
            </div>
            <div>
              {t("accountSettings.accountSettings", "Password Settings")}
              <p className="mt-1 font-sans text-sm font-normal tracking-normal text-muted-foreground">
                更新你的登录凭证，保持 Bingka 账户安全。
              </p>
            </div>
          </div>
          <Button form="password-form" size="sm" type="submit">
            {t("accountSettings.updatePassword", "Update Password")}
          </Button>
        </CardTitle>
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
                      className="bg-background/70"
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
                      className="bg-background/70"
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
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
