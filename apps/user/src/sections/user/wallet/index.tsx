"use client";

import { Card, CardContent } from "@workspace/ui/components/card";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { queryUserBalanceLog } from "@workspace/ui/services/user/user";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";
import Recharge from "@/sections/subscribe/recharge";
import { useGlobalStore } from "@/stores/global";

export default function Wallet() {
  const { t } = useTranslation("wallet");
  const typeMap: Record<number, string> = {
    0: t("type.0", "Type"),
    1: t("type.1", "Recharge"),
    2: t("type.2", "Withdrawal"),
    3: t("type.3", "Purchase"),
    4: t("type.4", "Refund"),
    5: t("type.5", "Reward"),
    6: t("type.6", "Commission"),
    231: t("type.231", "Auto Reset"),
    232: t("type.232", "Advance Reset"),
    233: t("type.233", "Paid Reset"),
    321: t("type.321", "Recharge"),
    322: t("type.322", "Withdraw"),
    323: t("type.323", "Payment"),
    324: t("type.324", "Refund"),
    325: t("type.325", "Reward"),
    326: t("type.326", "Admin Adjust"),
    331: t("type.331", "Purchase"),
    332: t("type.332", "Renewal"),
    333: t("type.333", "Refund"),
    334: t("type.334", "Withdraw"),
    335: t("type.335", "Admin Adjust"),
    341: t("type.341", "Increase"),
    342: t("type.342", "Reduce"),
  };
  const { user } = useGlobalStore();
  const ref = useRef<ProListActions>(null);
  const totalAssets =
    (user?.balance || 0) + (user?.commission || 0) + (user?.gift_amount || 0);
  return (
    <>
      <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/40 shadow-md backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg">
        <CardContent className="relative p-6">
          <div className="-right-20 -top-20 pointer-events-none absolute h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
          <h2 className="mb-6 flex items-center gap-3 font-medium font-serif text-2xl text-foreground tracking-wide">
            <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
              💼
            </div>
            {t("assetOverview", "Asset Overview")}
          </h2>
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-muted-foreground text-sm">
                  {t("totalAssets", "Total Assets")}
                </p>
                <p className="font-bold text-3xl text-foreground">
                  <Display type="currency" value={totalAssets} />
                </p>
              </div>
              <Recharge />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-primary/10 bg-secondary/75 p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <p className="font-medium text-secondary-foreground text-sm opacity-80">
                {t("balance", "Balance")}
              </p>
              <p className="font-bold text-2xl text-secondary-foreground">
                <Display type="currency" value={user?.balance} />
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/75 p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <p className="font-medium text-secondary-foreground text-sm opacity-80">
                {t("giftAmount", "Gift Amount")}
              </p>
              <p className="font-bold text-2xl text-secondary-foreground">
                <Display type="currency" value={user?.gift_amount} />
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-secondary/75 p-4 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-md">
              <p className="font-medium text-secondary-foreground text-sm opacity-80">
                {t("commission", "Commission")}
              </p>
              <p className="font-bold text-2xl text-secondary-foreground">
                <Display type="currency" value={user?.commission} />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <ProList<API.BalanceLog, Record<string, unknown>>
        action={ref}
        renderItem={(item) => (
          <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/40 shadow-md backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg">
            <CardContent className="text-sm">
              <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col lg:grid-cols-4">
                <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                  <span className="text-muted-foreground">
                    {t("createdAt", "Created At")}
                  </span>
                  <time>{formatDate(item.timestamp)}</time>
                </li>
                <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                  <span className="text-muted-foreground">
                    {t("type.0", "Type")}
                  </span>
                  <span>
                    {typeMap[item.type] ||
                      t(`type.${item.type}`, "Unknown Type")}
                  </span>
                </li>
                <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                  <span className="text-muted-foreground">
                    {t("amount", "Amount")}
                  </span>
                  <span>
                    <Display type="currency" value={item.amount} />
                  </span>
                </li>

                <li className="rounded-xl bg-muted/30 p-3">
                  <span className="text-muted-foreground">
                    {t("balance", "Balance")}
                  </span>
                  <span>
                    <Display type="currency" value={item.balance} />
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
        request={async (pagination, filter) => {
          const response = await queryUserBalanceLog({
            ...pagination,
            ...filter,
          });
          return {
            list: response.data.data?.list || [],
            total: response.data.data?.total || 0,
          };
        }}
      />
    </>
  );
}
