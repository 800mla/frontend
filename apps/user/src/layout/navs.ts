import { useTranslation } from "react-i18next";

export interface NavItem {
  title: string;
  url: string;
  icon: string;
}

export interface NavGroup {
  title: string;
  url?: string;
  icon?: string;
  items?: NavItem[];
}

export function useNavs() {
  const { t } = useTranslation("components");

  const navs: NavGroup[] = [
    {
      title: t("menu.dashboard", "Overview"),
      url: "/dashboard",
      icon: "uil:dashboard",
    },
    {
      title: t("menu.personal", "Account"),
      items: [
        {
          title: t("menu.profile", "Profile"),
          url: "/profile",
          icon: "uil:user",
        },
      ],
    },
    {
      title: t("menu.server", "Access"),
      items: [
        {
          url: "/subscribe",
          icon: "uil:shop",
          title: t("menu.subscribe", "Plans"),
        },
      ],
    },
    {
      title: t("menu.finance", "Billing"),
      items: [
        {
          url: "/order",
          icon: "uil:notes",
          title: t("menu.order", "Orders"),
        },
        {
          url: "/wallet",
          icon: "uil:wallet",
          title: t("menu.wallet", "Balance"),
        },
        {
          url: "/affiliate",
          icon: "uil:users-alt",
          title: t("menu.affiliate", "Referrals"),
        },
      ],
    },
    {
      title: t("menu.help", "Support"),
      items: [
        {
          url: "/document",
          icon: "uil:book-alt",
          title: t("menu.document", "Guides"),
        },
        {
          url: "/announcement",
          icon: "uil:megaphone",
          title: t("menu.announcement", "Updates"),
        },
        {
          url: "/ticket",
          icon: "uil:message",
          title: t("menu.ticket", "Tickets"),
        },
      ],
    },
  ];

  return navs;
}

export function useFindNavByUrl(url: string) {
  const navs = useNavs();

  for (const nav of navs) {
    if (nav.url && nav.url === url) {
      return [nav];
    }
    if (nav.items) {
      const current = nav.items.find((item) => item.url === url);
      if (current) {
        return [nav, current];
      }
    }
  }
  return [];
}

export function useNavItems() {
  const { t } = useTranslation("components");

  return [
    {
      url: "/profile",
      icon: "uil:user",
      title: t("menu.profile", "Profile"),
    },
    {
      url: "/subscribe",
      icon: "uil:shop",
      title: t("menu.subscribe", "Plans"),
    },
    {
      url: "/order",
      icon: "uil:notes",
      title: t("menu.order", "Orders"),
    },
    {
      url: "/wallet",
      icon: "uil:wallet",
      title: t("menu.wallet", "Balance"),
    },
  ];
}
