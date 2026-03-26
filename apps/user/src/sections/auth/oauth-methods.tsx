"use client";

import { Button } from "@workspace/ui/components/button";
import { Icon } from "@workspace/ui/composed/icon";
import { oAuthLogin } from "@workspace/ui/services/common/oauth";
import { useGlobalStore } from "@/stores/global";

const icons = {
  apple: "uil:apple",
  google: "logos:google-icon",
  facebook: "logos:facebook",
  github: "uil:github",
  telegram: "logos:telegram",
};

export function OAuthMethods() {
  const { common } = useGlobalStore();
  const { oauth_methods } = common;
  const OAUTH_METHODS = oauth_methods?.filter(
    (method: string) => !["mobile", "email", "device"].includes(method)
  );
  return (
    OAUTH_METHODS?.length > 0 && (
      <>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border/60 after:border-t">
          <span className="relative z-10 rounded-full border border-border/45 bg-background px-3 py-1 font-medium text-muted-foreground text-xs tracking-[0.08em] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            也可通过合作平台继续
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {OAUTH_METHODS?.map((method: string) => (
            <Button
              asChild
              className="hover:-translate-y-0.5 size-12 rounded-2xl border border-border/60 bg-background/75 p-2 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.35)] transition-all hover:border-primary/35 hover:bg-background"
              key={method}
              onClick={async () => {
                const { data } = await oAuthLogin({
                  method,
                  // OAuth providers disallow URL fragments (#) in redirect URIs.
                  // Use a real path (with trailing slash so static hosting can serve /oauth/<provider>/index.html)
                  // which then bridges into our hash-router at /#/oauth/<provider>.
                  redirect: `${window.location.origin}/oauth/${method}/`,
                });
                if (data.data?.redirect) {
                  window.location.href = data.data?.redirect;
                }
              }}
              size="icon"
              variant="outline"
            >
              <Icon icon={icons[method as keyof typeof icons]} />
            </Button>
          ))}
        </div>
      </>
    )
  );
}
