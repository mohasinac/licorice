import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getOrders } from "@/lib/db";
import { getServerUser } from "@/lib/auth";
import { OrderCard } from "@/components/account/OrderCard";

export const metadata: Metadata = { title: "My Orders" };

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("account");
  const user = await getServerUser();
  const orders = user ? await getOrders({ userId: user.uid }) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-foreground mb-6 text-3xl font-bold">{t("myOrders")}</h1>

      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("noOrdersYet")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
