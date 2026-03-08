// components/admin/AnalyticsCharts.tsx
// Admin analytics charts — Revenue trend, AOV trend, Orders trend,
// Customer growth, Product catalog growth, Review growth.
// All server-rendered SVG, no chart library.

interface TimePoint {
  label: string; // "Jan", "Feb" etc.
  value: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}

interface LowStockItem {
  name: string;
  variant: string;
  stock: number;
  threshold: number;
}

interface AnalyticsChartsProps {
  // Economic
  monthlyRevenue: TimePoint[];
  monthlyOrders: TimePoint[];
  monthlyAOV: TimePoint[];
  revenueByCategoryToday: { label: string; value: number; color: string }[];
  paymentMethodBreakdown: { label: string; count: number; color: string }[];
  // Growth
  monthlyCustomers: TimePoint[];
  monthlyProducts: TimePoint[];
  monthlyReviews: TimePoint[];
  // Products & Inventory
  topProducts: TopProduct[];
  lowInventory: LowStockItem[];
}

// ── Shared SVG line/area chart ────────────────────────────────────────────────

function LineAreaChart({
  data,
  color = "var(--color-primary)",
  prefix = "",
  suffix = "",
  ariaLabel,
}: {
  data: TimePoint[];
  color?: string;
  prefix?: string;
  suffix?: string;
  ariaLabel: string;
}) {
  const W = 480;
  const H = 120;
  const PAD = { top: 12, right: 12, bottom: 22, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const vals = data.map((d) => d.value);
  const maxVal = Math.max(...vals, 1);

  function xPx(i: number) {
    return PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  }
  function yPx(val: number) {
    return PAD.top + chartH - (val / maxVal) * chartH;
  }

  const points = data.map((d, i) => `${xPx(i).toFixed(1)},${yPx(d.value).toFixed(1)}`).join(" ");
  const areaPoints = [
    `${PAD.left},${PAD.top + chartH}`,
    ...data.map((d, i) => `${xPx(i).toFixed(1)},${yPx(d.value).toFixed(1)}`),
    `${xPx(data.length - 1).toFixed(1)},${PAD.top + chartH}`,
  ].join(" ");

  const yTicks = [0, maxVal / 2, maxVal].map((v) => ({
    val: v,
    label: `${prefix}${v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0)}${suffix}`,
    y: yPx(v),
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label={ariaLabel} role="img">
      {yTicks.map((t) => (
        <g key={t.label}>
          <line
            x1={PAD.left}
            y1={t.y}
            x2={W - PAD.right}
            y2={t.y}
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
          />
          <text
            x={PAD.left - 4}
            y={t.y + 3}
            textAnchor="end"
            fontSize={7}
            fill="currentColor"
            fillOpacity={0.45}
          >
            {t.label}
          </text>
        </g>
      ))}

      {data.length > 1 && (
        <>
          <polygon points={areaPoints} fill={color} fillOpacity={0.1} />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      )}

      {data.map((d, i) => (
        <text
          key={d.label}
          x={xPx(i)}
          y={H - 4}
          textAnchor="middle"
          fontSize={7}
          fill="currentColor"
          fillOpacity={0.45}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

// ── Donut chart (reusable) ────────────────────────────────────────────────────

function DonutChart({
  slices,
  ariaLabel,
}: {
  slices: { label: string; count: number; color: string }[];
  ariaLabel: string;
}) {
  const total = slices.reduce((s, v) => s + v.count, 0);
  const R = 36;
  const CX = 48;
  const CY = 48;
  const CIRCUMFERENCE = 2 * Math.PI * R;

  let offset = 0;
  const arcs = slices.map((s) => {
    const ratio = total > 0 ? s.count / total : 0;
    const dash = ratio * CIRCUMFERENCE;
    const gap = CIRCUMFERENCE - dash;
    const arc = { ...s, dash, gap, rotation: (offset / CIRCUMFERENCE) * 360 };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 96 96" className="h-24 w-24 shrink-0" aria-label={ariaLabel} role="img">
        {total === 0 ? (
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={12}
          />
        ) : (
          arcs.map((arc, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={12}
              strokeDasharray={`${arc.dash} ${arc.gap}`}
              strokeDashoffset={0}
              transform={`rotate(${arc.rotation - 90} ${CX} ${CY})`}
            />
          ))
        )}
        <text
          x={CX}
          y={CY + 4}
          textAnchor="middle"
          fontSize={13}
          fontWeight="600"
          fill="currentColor"
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-1 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">
              {s.label}: <strong className="text-foreground">{s.count}</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Horizontal bar chart for revenue by category ─────────────────────────────

function CategoryBars({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-foreground truncate font-medium capitalize">{d.label}</span>
            <span className="text-muted-foreground ml-2 shrink-0">
              ₹{d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}K` : d.value.toFixed(0)}
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color }}
            />
          </div>
        </li>
      ))}
      {data.length === 0 && (
        <p className="text-muted-foreground text-xs">No revenue data available</p>
      )}
    </ul>
  );
}

// ── Most popular products bar chart ───────────────────────────────────────────

function TopProductsBars({ products }: { products: TopProduct[] }) {
  const maxUnits = Math.max(...products.map((p) => p.units), 1);

  return (
    <ul className="space-y-3">
      {products.map((p, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-foreground truncate font-medium">{p.name}</span>
            <span className="text-muted-foreground ml-2 shrink-0">
              {p.units} units
              <span className="text-muted-foreground/60 ml-1">
                · ₹{p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}K` : p.revenue.toFixed(0)}
              </span>
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-[#6366f1]"
              style={{ width: `${(p.units / maxUnits) * 100}%` }}
            />
          </div>
        </li>
      ))}
      {products.length === 0 && (
        <p className="text-muted-foreground text-xs">No sales data available</p>
      )}
    </ul>
  );
}

// ── Low inventory table ──────────────────────────────────────────────────────

function LowInventoryTable({ items }: { items: LowStockItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th className="text-muted-foreground pb-2 text-left font-semibold">Product</th>
            <th className="text-muted-foreground pb-2 text-left font-semibold">Variant</th>
            <th className="text-muted-foreground pb-2 text-right font-semibold">Stock</th>
            <th className="text-muted-foreground pb-2 text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {items.map((item, i) => (
            <tr key={i}>
              <td className="text-foreground truncate py-2 font-medium" style={{ maxWidth: 180 }}>
                {item.name}
              </td>
              <td className="text-muted-foreground py-2">{item.variant}</td>
              <td className="py-2 text-right font-mono font-semibold">
                <span
                  className={
                    item.stock <= 0
                      ? "text-[#ef4444]"
                      : item.stock <= 5
                        ? "text-[#f59e0b]"
                        : "text-foreground"
                  }
                >
                  {item.stock}
                </span>
              </td>
              <td className="py-2 text-right">
                {item.stock <= 0 ? (
                  <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    Out of stock
                  </span>
                ) : item.stock <= 5 ? (
                  <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Critical
                  </span>
                ) : (
                  <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-semibold text-yellow-700">
                    Low
                  </span>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="text-muted-foreground py-6 text-center text-sm">
                All products are well-stocked
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function AnalyticsCharts({
  monthlyRevenue,
  monthlyOrders,
  monthlyAOV,
  revenueByCategoryToday,
  paymentMethodBreakdown,
  monthlyCustomers,
  monthlyProducts,
  monthlyReviews,
  topProducts,
  lowInventory,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* ── Economic Growth ───────────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading text-foreground mb-4 text-lg font-semibold">
          Economic Growth
        </h2>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Monthly Revenue */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Monthly Revenue (Last 12 Months)
            </h3>
            <LineAreaChart
              data={monthlyRevenue}
              color="var(--color-primary)"
              prefix="₹"
              ariaLabel="Monthly revenue trend"
            />
          </section>

          {/* Monthly Orders */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Monthly Orders (Last 12 Months)
            </h3>
            <LineAreaChart
              data={monthlyOrders}
              color="#3b82f6"
              ariaLabel="Monthly orders trend"
            />
          </section>

          {/* Average Order Value */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Avg. Order Value (Last 12 Months)
            </h3>
            <LineAreaChart
              data={monthlyAOV}
              color="#8b5cf6"
              prefix="₹"
              ariaLabel="Average order value trend"
            />
          </section>

          {/* Revenue by Category */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Revenue by Category (This Month)
            </h3>
            <CategoryBars data={revenueByCategoryToday} />
          </section>
        </div>

        {/* Payment Method Breakdown */}
        <section className="bg-surface rounded-2xl p-5 shadow-sm">
          <h3 className="text-foreground mb-3 text-sm font-semibold">Payment Method Breakdown (This Month)</h3>
          <DonutChart slices={paymentMethodBreakdown} ariaLabel="Payment method breakdown" />
        </section>
      </div>

      {/* ── Products & Inventory ──────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading text-foreground mb-4 text-lg font-semibold">
          Products &amp; Inventory
        </h2>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Most Popular Products */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Most Popular Products (by units sold)
            </h3>
            <TopProductsBars products={topProducts} />
          </section>

          {/* Low Inventory */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Low Inventory Alert
            </h3>
            <LowInventoryTable items={lowInventory} />
          </section>
        </div>
      </div>

      {/* ── Website Growth ────────────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading text-foreground mb-4 text-lg font-semibold">
          Website Growth
        </h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Growth */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Registered Customers
            </h3>
            <LineAreaChart
              data={monthlyCustomers}
              color="#22c55e"
              ariaLabel="Customer growth trend"
            />
          </section>

          {/* Product Catalog Growth */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Active Products
            </h3>
            <LineAreaChart
              data={monthlyProducts}
              color="#f59e0b"
              ariaLabel="Product catalog growth"
            />
          </section>

          {/* Reviews Growth */}
          <section className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="text-foreground mb-3 text-sm font-semibold">
              Approved Reviews
            </h3>
            <LineAreaChart
              data={monthlyReviews}
              color="#ec4899"
              ariaLabel="Reviews growth trend"
            />
          </section>
        </div>
      </div>
    </div>
  );
}
