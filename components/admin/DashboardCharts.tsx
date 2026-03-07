// components/admin/DashboardCharts.tsx
// Admin dashboard charts — Revenue (30d line), Order status today (donut),
// Top 5 products (horizontal bars). All server-rendered, no chart library.

interface RevenuePoint {
  date: string; // "Mar 1", "Mar 2" etc.
  amount: number;
}

interface StatusSlice {
  label: string;
  count: number;
  color: string;
}

interface TopProduct {
  name: string;
  revenue: number;
  units: number;
}

interface DashboardChartsProps {
  revenue30Days: RevenuePoint[];
  orderStatusToday: StatusSlice[];
  topProducts30Days: TopProduct[];
}

// ── Revenue line chart ────────────────────────────────────────────────────────

function RevenueLineChart({ data }: { data: RevenuePoint[] }) {
  const W = 480;
  const H = 96;
  const PAD = { top: 8, right: 8, bottom: 20, left: 40 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const minVal = 0;

  function xPx(i: number) {
    return PAD.left + (i / Math.max(data.length - 1, 1)) * chartW;
  }
  function yPx(val: number) {
    return PAD.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  }

  const points = data.map((d, i) => `${xPx(i).toFixed(1)},${yPx(d.amount).toFixed(1)}`).join(" ");
  const areaPoints = [
    `${PAD.left},${PAD.top + chartH}`,
    ...data.map((d, i) => `${xPx(i).toFixed(1)},${yPx(d.amount).toFixed(1)}`),
    `${xPx(data.length - 1).toFixed(1)},${PAD.top + chartH}`,
  ].join(" ");

  // Y axis ticks
  const yTicks = [0, maxVal / 2, maxVal].map((v) => ({
    val: v,
    label: v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v.toFixed(0)}`,
    y: yPx(v),
  }));

  // X axis: show label every ~5 days
  const xLabels = data
    .map((d, i) => ({ date: d.date, x: xPx(i) }))
    .filter((_, i) => i % 5 === 0 || i === data.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      aria-label="Revenue last 30 days"
      role="img"
    >
      {/* Y grid lines */}
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

      {/* Area fill */}
      {data.length > 1 && (
        <polygon points={areaPoints} fill="var(--color-primary)" fillOpacity={0.1} />
      )}

      {/* Line */}
      {data.length > 1 && (
        <polyline
          points={points}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* X axis labels */}
      {xLabels.map((l) => (
        <text
          key={l.date}
          x={l.x}
          y={H - 4}
          textAnchor="middle"
          fontSize={7}
          fill="currentColor"
          fillOpacity={0.45}
        >
          {l.date}
        </text>
      ))}
    </svg>
  );
}

// ── Orders by status donut ────────────────────────────────────────────────────

function OrderStatusDonut({ slices }: { slices: StatusSlice[] }) {
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
      <svg viewBox="0 0 96 96" className="h-24 w-24 shrink-0" aria-label="Orders by status" role="img">
        {total === 0 ? (
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={12} />
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
        <text x={CX} y={CY + 2} textAnchor="middle" fontSize={13} fontWeight="600" fill="currentColor">
          {total}
        </text>
        <text x={CX} y={CY + 13} textAnchor="middle" fontSize={7} fill="currentColor" fillOpacity={0.5}>
          today
        </text>
      </svg>

      <ul className="space-y-1 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-muted-foreground">
              {s.label}: <strong className="text-foreground">{s.count}</strong>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Top products bar chart ────────────────────────────────────────────────────

function TopProductsBars({ products }: { products: TopProduct[] }) {
  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <ul className="space-y-3">
      {products.map((p, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-foreground truncate font-medium">{p.name}</span>
            <span className="text-muted-foreground ml-2 shrink-0">
              ₹{p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}K` : p.revenue.toFixed(0)}
              <span className="text-muted-foreground/60 ml-1">· {p.units} units</span>
            </span>
          </div>
          <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
            />
          </div>
        </li>
      ))}
      {products.length === 0 && (
        <p className="text-muted-foreground text-xs">No sales data for the last 30 days</p>
      )}
    </ul>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function DashboardCharts({
  revenue30Days,
  orderStatusToday,
  topProducts30Days,
}: DashboardChartsProps) {
  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-3">
      {/* Revenue line chart */}
      <section className="bg-surface col-span-2 rounded-2xl p-5 shadow-sm">
        <h2 className="text-foreground mb-4 text-sm font-semibold">Revenue — Last 30 Days</h2>
        <RevenueLineChart data={revenue30Days} />
      </section>

      {/* Order status donut */}
      <section className="bg-surface rounded-2xl p-5 shadow-sm">
        <h2 className="text-foreground mb-4 text-sm font-semibold">Orders by Status Today</h2>
        <OrderStatusDonut slices={orderStatusToday} />
      </section>

      {/* Top 5 products */}
      <section className="bg-surface col-span-3 rounded-2xl p-5 shadow-sm">
        <h2 className="text-foreground mb-4 text-sm font-semibold">
          Top 5 Products — Last 30 Days (by revenue)
        </h2>
        <TopProductsBars products={topProducts30Days} />
      </section>
    </div>
  );
}
