"use client";

import { Link } from "@tanstack/react-router";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ProList,
  type ProListActions,
} from "@workspace/ui/composed/pro-list/pro-list";
import { closeOrder, queryOrderList } from "@workspace/ui/services/user/order";
import { formatDate } from "@workspace/ui/utils/formatting";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Display } from "@/components/display";

export default function Order() {
  const { t } = useTranslation("order");
  const statusMap: Record<number, string> = {
    0: t("status.0", "Status"),
    1: t("status.1", "Pending"),
    2: t("status.2", "Paid"),
    3: t("status.3", "Cancelled"),
    4: t("status.4", "Closed"),
    5: t("status.5", "Completed"),
  };
  const typeMap: Record<number, string> = {
    0: t("type.0", "Type"),
    1: t("type.1", "New Purchase"),
    2: t("type.2", "Renewal"),
    3: t("type.3", "Reset Traffic"),
    4: t("type.4", "Recharge"),
  };

  const ref = useRef<ProListActions>(null);
  return (
    <ProList<API.OrderDetail, Record<string, unknown>>
      action={ref}
      renderItem={(item) => (
        <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-card/40 shadow-md backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="flex items-center gap-3 font-medium font-serif text-xl tracking-wide">
              <div className="flex items-center justify-center rounded-md bg-primary/20 p-1.5 text-primary">
                <span aria-hidden="true">☕</span>
              </div>
              <div>
                {t("orderNo", "Order No")}
                <p className="mt-1 font-mono font-normal text-muted-foreground text-sm tracking-wider">
                  {item.order_no}
                </p>
              </div>
            </CardTitle>
            <div className="flex gap-2">
              {item.status === 1 ? (
                <>
                  <Link
                    className={buttonVariants({ size: "sm" })}
                    key="payment"
                    search={{ order_no: item.order_no }}
                    to="/payment"
                  >
                    {t("payment", "Payment")}
                  </Link>
                  <Button
                    key="cancel"
                    onClick={async () => {
                      await closeOrder({ orderNo: item.order_no });
                      ref.current?.refresh();
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    {t("cancel", "Cancel")}
                  </Button>
                </>
              ) : (
                <Link
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  key="detail"
                  search={{ order_no: item.order_no }}
                  to="/payment"
                >
                  {t("detail", "Detail")}
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <ul className="grid grid-cols-2 gap-3 *:flex *:flex-col lg:grid-cols-4">
              <li className="rounded-xl bg-muted/30 p-3">
                <span className="text-muted-foreground">
                  {t("name", "Product Name")}
                </span>
                <span>
                  {item.subscribe.name ||
                    typeMap[item.type] ||
                    t(`type.${item.type}`, "Unknown Type")}
                </span>
              </li>
              <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                <span className="text-muted-foreground">
                  {t("paymentAmount", "Amount")}
                </span>
                <span>
                  <Display type="currency" value={item.amount} />
                </span>
              </li>
              <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                <span className="text-muted-foreground">
                  {t("status.0", "Status")}
                </span>
                <span>
                  {statusMap[item.status] ||
                    t(`status.${item.status}`, "Unknown Status")}
                </span>
              </li>
              <li className="rounded-xl bg-muted/30 p-3 font-semibold">
                <span className="text-muted-foreground">
                  {t("createdAt", "Created At")}
                </span>
                <time>{formatDate(item.created_at)}</time>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
      request={async (pagination, filter) => {
        const response = await queryOrderList({ ...pagination, ...filter });
        return {
          list: response.data.data?.list || [],
          total: response.data.data?.total || 0,
        };
      }}
    />
  );
}
