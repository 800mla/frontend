"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Empty from "@workspace/ui/composed/empty";
import { queryDocumentList } from "@workspace/ui/services/user/document";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TUTORIAL_DOCUMENT } from "@/config";
import { DocumentButton } from "@/sections/user/document/document-button";
import { getTutorialList } from "@/sections/user/document/tutorial";
import { TutorialButton } from "@/sections/user/document/tutorial-button";

export default function Document() {
  const { t, i18n } = useTranslation("document");
  const locale = i18n.language;
  const search = useSearch({ strict: false }) as { device?: string };
  const [activeTutorialTab, setActiveTutorialTab] = useState("");

  const { data } = useQuery({
    queryKey: ["queryDocumentList"],
    queryFn: async () => {
      const response = await queryDocumentList();
      const list = response.data.data?.list || [];
      return {
        tags: Array.from(
          new Set(
            list.reduce((acc: string[], item) => acc.concat(item.tags), [])
          )
        ),
        list,
      };
    },
  });
  const { tags, list: DocumentList } = data || { tags: [], list: [] };

  const { data: TutorialList } = useQuery({
    queryKey: ["getTutorialList", locale],
    queryFn: async () => {
      const list = await getTutorialList();
      return list.get(locale);
    },
    enabled: TUTORIAL_DOCUMENT === "true",
  });

  const preferredTutorialMatch = useMemo(() => {
    if (!(TutorialList?.length && search.device)) return null;

    const normalizedDevice = search.device.toLowerCase();

    for (const tutorial of TutorialList) {
      const candidates =
        tutorial.subItems && tutorial.subItems.length > 0
          ? tutorial.subItems
          : [tutorial];

      const matchedItem = candidates.find((item) =>
        getTutorialDeviceScore(item, normalizedDevice)
      );

      if (matchedItem) {
        return {
          itemPath: matchedItem.path,
          tabTitle: tutorial.title,
        };
      }
    }

    const fallbackIndex = getDeviceFallbackIndex(normalizedDevice);
    if (fallbackIndex === -1 || !TutorialList[fallbackIndex]) return null;

    const fallbackTutorial = TutorialList[fallbackIndex];
    const fallbackItem =
      fallbackTutorial.subItems && fallbackTutorial.subItems.length > 0
        ? fallbackTutorial.subItems[0]
        : fallbackTutorial;
    if (!fallbackItem) return null;

    return {
      itemPath: fallbackItem.path,
      tabTitle: fallbackTutorial.title,
    };
  }, [TutorialList, search.device]);

  useEffect(() => {
    if (!TutorialList?.length) return;

    setActiveTutorialTab((currentValue) => {
      if (
        currentValue &&
        TutorialList.some((tutorial) => tutorial.title === currentValue)
      ) {
        return currentValue;
      }

      return (
        preferredTutorialMatch?.tabTitle ||
        TutorialList[0]?.title ||
        currentValue
      );
    });
  }, [TutorialList, preferredTutorialMatch?.tabTitle]);

  useEffect(() => {
    if (!preferredTutorialMatch?.tabTitle) return;

    const section = document.getElementById("tutorial-section");
    if (!section) return;

    const frameId = window.requestAnimationFrame(() => {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [preferredTutorialMatch?.tabTitle]);

  if (
    (!DocumentList || DocumentList.length === 0) &&
    (!TutorialList || TutorialList.length === 0)
  ) {
    return <Empty border />;
  }

  return (
    <div className="space-y-4">
      {DocumentList?.length > 0 && (
        <>
          <h2 className="flex items-center gap-1.5 font-semibold">
            {t("document", "Document")}
          </h2>
          <Tabs defaultValue="all">
            <TabsList className="h-full flex-wrap">
              <TabsTrigger value="all">{t("all", "All")}</TabsTrigger>
              {tags?.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all">
              <DocumentButton items={DocumentList} />
            </TabsContent>
            {tags?.map((item) => (
              <TabsContent key={item} value={item}>
                <DocumentButton
                  items={DocumentList.filter((docs) =>
                    item ? docs.tags.includes(item) : true
                  )}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {TutorialList && TutorialList?.length > 0 && (
        <>
          <h2
            className="flex items-center gap-1.5 font-semibold"
            id="tutorial-section"
          >
            {t("tutorial", "Tutorial")}
          </h2>
          <Tabs onValueChange={setActiveTutorialTab} value={activeTutorialTab}>
            <TabsList className="h-full flex-wrap">
              {TutorialList?.map((tutorial) => (
                <TabsTrigger key={tutorial.title} value={tutorial.title}>
                  {tutorial.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {TutorialList?.map((tutorial) => (
              <TabsContent key={tutorial.title} value={tutorial.title}>
                <TutorialButton
                  items={
                    tutorial.subItems && tutorial.subItems?.length > 0
                      ? tutorial.subItems
                      : [tutorial]
                  }
                  key={tutorial.path}
                />
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}

function getDeviceFallbackIndex(device: string) {
  if (device === "ios") return 0;
  if (device === "windows") return 1;
  if (device === "android") return 2;
  return -1;
}

function getTutorialDeviceScore(
  item: { path: string; title: string },
  device: string
) {
  const content = `${item.title} ${item.path}`.toLowerCase();

  const keywordMap: Record<string, string[]> = {
    ios: ["ios", "iphone", "ipad", "shadowrocket", "surge", "stash"],
    windows: ["windows", "window", "win", "verge", "nekoray"],
    android: [
      "android",
      "安卓",
      "v2rayng",
      "surfboard",
      "nekobox",
      "clash meta",
    ],
  };

  return (keywordMap[device] || []).some((keyword) =>
    content.includes(keyword)
  );
}
