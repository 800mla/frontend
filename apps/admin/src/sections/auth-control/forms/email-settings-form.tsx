import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
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
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Switch } from "@workspace/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { HTMLEditor } from "@workspace/ui/composed/editor/html";
import { EnhancedInput } from "@workspace/ui/composed/enhanced-input";
import { Icon } from "@workspace/ui/composed/icon";
import {
  getAuthMethodConfig,
  getEmailPlatform,
  testEmailSend,
  updateAuthMethodConfig,
} from "@workspace/ui/services/admin/authMethod";
import { useEffect, useMemo, useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

const emailSettingsSchema = z.object({
  id: z.number(),
  method: z.string(),
  enabled: z.boolean(),
  config: z
    .object({
      enable_verify: z.boolean(),
      enable_domain_suffix: z.boolean(),
      domain_suffix_list: z.string().optional(),
      verify_email_template: z.string().optional(),
      expiration_email_template: z.string().optional(),
      maintenance_email_template: z.string().optional(),
      traffic_exceed_email_template: z.string().optional(),
      platform: z.string(),
      platform_config: z
        .object({
          host: z.string().optional(),
          port: z.number().optional(),
          ssl: z.boolean(),
          user: z.string().optional(),
          pass: z.string().optional(),
          from: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

const defaultValues: EmailSettingsFormData = {
  id: 0,
  method: "email",
  enabled: false,
  config: {
    enable_verify: false,
    enable_domain_suffix: false,
    domain_suffix_list: "",
    verify_email_template: "",
    expiration_email_template: "",
    maintenance_email_template: "",
    traffic_exceed_email_template: "",
    platform: "smtp",
    platform_config: {
      host: "",
      port: 587,
      ssl: false,
      user: "",
      pass: "",
      from: "",
    },
  },
};

function normalizeConfig(
  data?: API.AuthMethodConfig,
  fallbackPlatform?: string
): EmailSettingsFormData {
  const config = (data?.config || {}) as Record<string, any>;
  const platformConfig = (config.platform_config || {}) as Record<string, any>;

  return {
    ...defaultValues,
    ...data,
    config: {
      ...defaultValues.config!,
      ...config,
      enable_verify:
        typeof config.enable_verify === "boolean"
          ? config.enable_verify
          : defaultValues.config!.enable_verify,
      enable_domain_suffix:
        typeof config.enable_domain_suffix === "boolean"
          ? config.enable_domain_suffix
          : defaultValues.config!.enable_domain_suffix,
      platform:
        config.platform || fallbackPlatform || defaultValues.config!.platform,
      platform_config: {
        ...defaultValues.config!.platform_config!,
        ...platformConfig,
        ssl:
          typeof platformConfig.ssl === "boolean"
            ? platformConfig.ssl
            : defaultValues.config!.platform_config!.ssl,
      },
    },
  };
}

export default function EmailSettingsForm() {
  const { t } = useTranslation("auth-control");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["getAuthMethodConfig", "email"],
    queryFn: async () => {
      const { data } = await getAuthMethodConfig({
        method: "email",
      });
      return data.data;
    },
    enabled: open,
  });

  const { data: platforms } = useQuery({
    queryKey: ["getEmailPlatform"],
    queryFn: async () => {
      const { data } = await getEmailPlatform();
      return data.data?.list || [];
    },
    enabled: open,
  });

  const form = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues,
  });

  const currentPlatform = form.watch("config.platform");
  const selectedPlatform = useMemo(
    () => platforms?.find((item) => item.platform === currentPlatform),
    [currentPlatform, platforms]
  );
  const platformFieldDescription =
    selectedPlatform?.platform_field_description || {};

  useEffect(() => {
    if (!(data || platforms)) return;
    const fallbackPlatform = platforms?.[0]?.platform || "smtp";
    form.reset(normalizeConfig(data, fallbackPlatform));
  }, [data, form, platforms]);

  async function onSubmit(values: EmailSettingsFormData) {
    setLoading(true);
    try {
      await updateAuthMethodConfig(
        normalizeConfig(
          values as API.AuthMethodConfig,
          values.config?.platform
        ) as API.UpdateAuthMethodConfigRequest
      );
      toast.success(t("common.saveSuccess", "Saved successfully"));
      refetch();
      setOpen(false);
    } catch (_error) {
      toast.error(t("common.saveFailed", "Save failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <div className="flex cursor-pointer items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" icon="mdi:email-outline" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {t("email.title", "Email Settings")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t(
                  "email.description",
                  "Configure email authentication and templates"
                )}
              </p>
            </div>
          </div>
          <Icon className="size-6" icon="mdi:chevron-right" />
        </div>
      </SheetTrigger>
      <SheetContent className="md:!max-w-screen-lg max-w-full">
        <SheetHeader>
          <SheetTitle>{t("email.title", "Email Settings")}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100dvh-48px-36px-36px-24px-env(safe-area-inset-top))] px-6">
          <Form {...form}>
            <form
              className="space-y-4 pt-4"
              id="email-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Tabs className="space-y-4" defaultValue="basic">
                <TabsList className="flex h-full w-full flex-wrap *:flex-auto md:flex-nowrap">
                  <TabsTrigger value="basic">
                    {t("email.basicSettings", "Basic Settings")}
                  </TabsTrigger>
                  <TabsTrigger value="smtp">
                    {t("email.smtpSettings", "SMTP Settings")}
                  </TabsTrigger>
                  <TabsTrigger value="verify">
                    {t("email.verifyTemplate", "Verify Template")}
                  </TabsTrigger>
                  <TabsTrigger value="expiration">
                    {t("email.expirationTemplate", "Expiration Template")}
                  </TabsTrigger>
                  <TabsTrigger value="maintenance">
                    {t("email.maintenanceTemplate", "Maintenance Template")}
                  </TabsTrigger>
                  <TabsTrigger value="traffic">
                    {t("email.trafficTemplate", "Traffic Template")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent className="space-y-4" value="basic">
                  <SectionIntro
                    description={t(
                      "email.basicSettingsDescription",
                      "控制邮箱登录、邮箱验证和允许注册的邮箱域名。"
                    )}
                    title={t("email.basicSettings", "Basic Settings")}
                  />

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="rounded-2xl border bg-card/40 p-4">
                          <FormLabel>{t("email.enable", "Enable")}</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              className="!mt-0 float-end"
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            {t(
                              "email.enableDescription",
                              "When enabled, users can sign in with email"
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.enable_verify"
                      render={({ field }) => (
                        <FormItem className="rounded-2xl border bg-card/40 p-4">
                          <FormLabel>
                            {t("email.emailVerification", "Email Verification")}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              className="!mt-0 float-end"
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription>
                            {t(
                              "email.emailVerificationDescription",
                              "Require email verification for new users"
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="config.enable_domain_suffix"
                    render={({ field }) => (
                      <FormItem className="rounded-2xl border bg-card/40 p-4">
                        <FormLabel>
                          {t(
                            "email.emailSuffixWhitelist",
                            "Email Suffix Whitelist"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "email.emailSuffixWhitelistDescription",
                            "Only allow emails from whitelisted domains"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="config.domain_suffix_list"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("email.whitelistSuffixes", "Whitelist Suffixes")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="h-32"
                            onChange={field.onChange}
                            placeholder={t(
                              "email.whitelistSuffixesPlaceholder",
                              "gmail.com, outlook.com"
                            )}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "email.whitelistSuffixesDescription",
                            "One domain suffix per line"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent className="space-y-4" value="smtp">
                  <SectionIntro
                    description={t(
                      "email.smtpSettingsDescription",
                      "根据当前邮件平台填写投递参数。平台切换与字段要求以后端接口返回为准。"
                    )}
                    title={t("email.smtpSettings", "SMTP Settings")}
                  />

                  <div className="rounded-2xl border bg-card/40 p-4">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                      <FormField
                        control={form.control}
                        name="config.platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("email.deliveryProvider", "Email Provider")}
                            </FormLabel>
                            <FormControl>
                              <Select
                                disabled={isFetching}
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t(
                                      "email.deliveryProviderPlaceholder",
                                      "Select a provider"
                                    )}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {platforms?.map((item) => (
                                    <SelectItem
                                      key={item.platform}
                                      value={item.platform}
                                    >
                                      {item.platform}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormDescription>
                              {t(
                                "email.deliveryProviderDescription",
                                "The available provider list is returned by the backend API."
                              )}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedPlatform?.platform_url ? (
                        <div className="flex items-end">
                          <Button asChild size="sm" variant="outline">
                            <a
                              href={selectedPlatform.platform_url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {t("email.providerDocs", "Provider Docs")}
                            </a>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="config.platform_config.host"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t(
                              "email.smtpServerAddress",
                              "SMTP Server Address"
                            )}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              onValueChange={field.onChange}
                              placeholder="smtp.resend.com"
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>
                            {platformFieldDescription.host ||
                              t(
                                "email.smtpServerAddressDescription",
                                "The SMTP server hostname"
                              )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.platform_config.port"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("email.smtpServerPort", "SMTP Server Port")}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                              placeholder="465"
                              type="number"
                              value={field.value?.toString()}
                            />
                          </FormControl>
                          <FormDescription>
                            {t(
                              "email.smtpServerPortDescription",
                              "The SMTP server port (usually 25, 465, or 587)"
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.platform_config.user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("email.smtpAccount", "SMTP Account")}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              onValueChange={field.onChange}
                              placeholder="resend"
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>
                            {platformFieldDescription.user ||
                              t(
                                "email.smtpAccountDescription",
                                "The SMTP authentication username"
                              )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="config.platform_config.pass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("email.smtpPassword", "SMTP Password")}
                          </FormLabel>
                          <FormControl>
                            <EnhancedInput
                              onValueChange={field.onChange}
                              placeholder={t(
                                "email.smtpPasswordPlaceholder",
                                "Enter SMTP password or API key"
                              )}
                              type="password"
                              value={field.value}
                            />
                          </FormControl>
                          <FormDescription>
                            {platformFieldDescription.pass ||
                              t(
                                "email.smtpPasswordDescription",
                                "The SMTP authentication password"
                              )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="config.platform_config.from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("email.senderAddress", "Sender Address")}
                        </FormLabel>
                        <FormControl>
                          <EnhancedInput
                            onValueChange={field.onChange}
                            placeholder="no-reply@example.com"
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                          {platformFieldDescription.from ||
                            t(
                              "email.senderAddressDescription",
                              "The email address that appears in the From field"
                            )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="config.platform_config.ssl"
                    render={({ field }) => (
                      <FormItem className="rounded-2xl border bg-card/40 p-4">
                        <FormLabel>
                          {t(
                            "email.smtpEncryptionMethod",
                            "SSL/TLS Encryption"
                          )}
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            className="!mt-0 float-end"
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          {t(
                            "email.smtpEncryptionMethodDescription",
                            "Enable SSL/TLS encryption for SMTP connection"
                          )}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="rounded-2xl border bg-card/40 p-4">
                    <div className="mb-3 space-y-1">
                      <FormLabel>
                        {t("email.sendTestEmail", "Send Test Email")}
                      </FormLabel>
                      <p className="text-muted-foreground text-sm">
                        {t(
                          "email.sendTestEmailDescription",
                          "Send a test email to verify your SMTP configuration"
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EnhancedInput
                        onValueChange={(value) => setTestEmail(value as string)}
                        placeholder="test@example.com"
                        type="email"
                        value={testEmail}
                      />
                      <Button
                        disabled={!testEmail || isFetching}
                        onClick={async () => {
                          if (!testEmail) return;
                          try {
                            await testEmailSend({ email: testEmail });
                            toast.success(
                              t("email.sendSuccess", "Email sent successfully")
                            );
                          } catch {
                            toast.error(
                              t("email.sendFailure", "Email send failed")
                            );
                          }
                        }}
                        type="button"
                      >
                        {t("email.sendTestEmail", "Send Test Email")}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent className="space-y-4" value="verify">
                  <SectionIntro
                    description={t(
                      "email.templateSettingsDescription",
                      "模板编辑区保留变量提示，减少不必要的重复说明。"
                    )}
                    title={t("email.verifyTemplate", "Verify Template")}
                  />
                  <TemplateEditor
                    control={form.control}
                    label={t(
                      "email.verifyEmailTemplate",
                      "Verify Email Template"
                    )}
                    name="config.verify_email_template"
                  />
                </TabsContent>

                <TabsContent className="space-y-4" value="expiration">
                  <TemplateEditor
                    control={form.control}
                    label={t(
                      "email.expirationEmailTemplate",
                      "Expiration Email Template"
                    )}
                    name="config.expiration_email_template"
                  />
                </TabsContent>

                <TabsContent className="space-y-4" value="maintenance">
                  <TemplateEditor
                    control={form.control}
                    label={t(
                      "email.maintenanceEmailTemplate",
                      "Maintenance Email Template"
                    )}
                    name="config.maintenance_email_template"
                  />
                </TabsContent>

                <TabsContent className="space-y-4" value="traffic">
                  <TemplateEditor
                    control={form.control}
                    label={t(
                      "email.trafficExceedEmailTemplate",
                      "Traffic Exceed Email Template"
                    )}
                    name="config.traffic_exceed_email_template"
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="flex-row justify-end gap-2 pt-3">
          <Button
            disabled={loading}
            onClick={() => setOpen(false)}
            variant="outline"
          >
            {t("common.cancel", "Cancel")}
          </Button>
          <Button disabled={loading} form="email-settings-form" type="submit">
            {loading && (
              <Icon className="mr-2 animate-spin" icon="mdi:loading" />
            )}
            {t("common.save", "Save")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card/40 p-4">
      <div className="font-medium text-sm">{title}</div>
      <p className="mt-1 text-muted-foreground text-sm leading-6">
        {description}
      </p>
    </div>
  );
}

function TemplateEditor({
  control,
  label,
  name,
}: {
  control: Control<EmailSettingsFormData>;
  label: string;
  name:
    | "config.verify_email_template"
    | "config.expiration_email_template"
    | "config.maintenance_email_template"
    | "config.traffic_exceed_email_template";
}) {
  const { t } = useTranslation("auth-control");

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <HTMLEditor
              onChange={field.onChange}
              placeholder={t("email.inputPlaceholder", "Please enter")}
              value={field.value}
            />
          </FormControl>
          <TemplateVariables />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function TemplateVariables() {
  const { t } = useTranslation("auth-control");

  const variables = [
    {
      code: "{{.Type}}",
      text: t(
        "email.templateVariables.type.description",
        "Email type (1: Register, 2: Reset Password)"
      ),
    },
    {
      code: "{{.SiteLogo}}",
      text: t("email.templateVariables.siteLogo.description", "Site logo URL"),
    },
    {
      code: "{{.SiteName}}",
      text: t("email.templateVariables.siteName.description", "Site name"),
    },
    {
      code: "{{.Expire}}",
      text: t(
        "email.templateVariables.expire.description",
        "Code expiration time"
      ),
    },
    {
      code: "{{.Code}}",
      text: t("email.templateVariables.code.description", "Verification code"),
    },
    {
      code: "{{.ExpireDate}}",
      text: t(
        "email.templateVariables.expireDate.description",
        "Subscription expiration date"
      ),
    },
    {
      code: "{{.MaintenanceDate}}",
      text: t(
        "email.templateVariables.maintenanceDate.description",
        "Maintenance date"
      ),
    },
    {
      code: "{{.MaintenanceTime}}",
      text: t(
        "email.templateVariables.maintenanceTime.description",
        "Maintenance time"
      ),
    },
  ];

  return (
    <div className="mt-4 rounded-2xl border bg-card/40 p-4">
      <p className="font-medium text-muted-foreground text-sm">
        {t("email.templateVariables.title", "Template Variables")}
      </p>
      <div className="mt-3 grid gap-2 text-muted-foreground text-xs">
        {variables.map((item) => (
          <div className="flex items-center gap-2" key={item.code}>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">
              {item.code}
            </code>
            <span>{item.text}</span>
          </div>
        ))}
        <div className="mt-1 rounded-xl border border-orange-500/20 bg-orange-500/8 px-3 py-2 text-orange-700 dark:text-orange-300">
          {t(
            "email.templateVariables.type.conditionalSyntax",
            "Use conditional syntax to display different content"
          )}
          <div className="mt-1">
            <code className="rounded bg-orange-50 px-1 text-xs dark:bg-orange-900/20">
              {"{{if eq .Type 1}}...{{else}}...{{end}}"}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
