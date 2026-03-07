import { Metadata } from "next";
import { getServerUser } from "@/lib/auth";
import { getOrders } from "@/lib/db";
import Link from "next/link";
import { OrderCard } from "@/components/account/OrderCard";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getServerUser();

  const recentOrders = user ? await getOrders({ userId: user.uid, limit: 3 }) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-heading text-foreground mb-2 text-3xl font-bold">
        Hi{user ? `, ${user.displayName ?? user.email}` : "!"}
      </h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Manage your orders, addresses and profile.
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Orders", href: `/${locale}/account/orders` },
          { label: "Wishlist", href: `/${locale}/account/wishlist` },
          { label: "Addresses", href: `/${locale}/account/addresses` },
          { label: "Profile", href: `/${locale}/account/profile` },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-surface hover:border-primary rounded-2xl border border-transparent px-5 py-4 shadow-sm transition-colors"
          >
            <span className="text-foreground font-medium">{link.label} →</span>
          </Link>
        ))}
      </div>

      {recentOrders.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-foreground text-lg font-semibold">Recent Orders</h2>
            <Link
              href={`/${locale}/account/orders`}
              className="text-primary text-sm hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
