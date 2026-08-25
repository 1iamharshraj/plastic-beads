import { Link } from "react-router";
import { Boxes, Palette, Factory, History, ArrowRight, Sparkles } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge, Btn, EmptyState, Skeleton, fmtDate, fmtINR } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";

export default function Dashboard() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.dashboard.stats.useQuery();
  const seed = trpc.settings.seedDemo.useMutation({
    onSuccess: async (r) => {
      if (r.seeded) {
        toast("good", "Sample materials, formulas and settings loaded.");
        await utils.invalidate();
      } else {
        toast("bad", "Your factory already has data — demo seed skipped.");
      }
    },
    onError: (e) => toast("bad", e.message),
  });

  const empty =
    data && data.materialCount === 0 && data.formulaCount === 0 && data.recentOrders.length === 0;

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Factory Floor</p>
          <h1 className="app-title">Production Overview</h1>
          <p className="app-sub">Stock, formulas and recent production runs at a glance.</p>
        </div>
        <Link to="/dashboard/production" className="app-btn app-btn-primary">
          <Factory size={16} /> New production check
        </Link>
      </header>

      {isLoading ? (
        <div className="app-stack">
          <div className="app-grid cols-4">
            <Skeleton h={104} /><Skeleton h={104} /><Skeleton h={104} /><Skeleton h={104} />
          </div>
          <Skeleton h={280} />
        </div>
      ) : empty ? (
        <EmptyState
          glyph={<Sparkles size={24} />}
          title="Your factory is empty — let's fix that"
          body="Load a demo dataset (7 raw materials, 3 color formulas, 4 variants, default costing) to explore every module, or add your own stock first."
          action={
            <div className="app-row">
              <Btn onClick={() => seed.mutate()} disabled={seed.isPending}>
                {seed.isPending ? "Loading…" : "Load sample data"}
              </Btn>
              <Link to="/dashboard/materials" className="app-btn app-btn-ghost">Add materials manually</Link>
            </div>
          }
        />
      ) : (
        <div className="app-stack">
          <div className="app-grid cols-4">
            <Link to="/dashboard/materials" className="app-stat">
              <span className="app-stat-label">Raw materials</span>
              <span className="app-stat-value">{data!.materialCount}</span>
              <span className="app-stat-hint">in inventory</span>
            </Link>
            <Link to="/dashboard/formulas" className="app-stat">
              <span className="app-stat-label">Color formulas</span>
              <span className="app-stat-value">{data!.formulaCount}</span>
              <span className="app-stat-hint">{data!.variantCount} variants</span>
            </Link>
            <Link to="/dashboard/materials" className="app-stat">
              <span className="app-stat-label">Stock value</span>
              <span className="app-stat-value" style={{ fontSize: 24, paddingTop: 4 }}>
                {fmtINR(data!.stockValue)}
              </span>
              <span className="app-stat-hint">qty × unit price</span>
            </Link>
            <Link to="/dashboard/history" className="app-stat">
              <span className="app-stat-label">Production orders</span>
              <span className="app-stat-value">{data!.recentOrders.length}</span>
              <span className="app-stat-hint">recent runs</span>
            </Link>
          </div>

          <div className="app-card">
            <h3 className="app-card-title">Recent production orders</h3>
            {data!.recentOrders.length === 0 ? (
              <p className="app-muted" style={{ margin: 0, fontSize: 14 }}>
                No production orders yet — run a feasibility check from the Production module.
              </p>
            ) : (
              <div className="app-stack" style={{ gap: 8 }}>
                {data!.recentOrders.map((o) => (
                  <Link
                    key={o.id}
                    to="/dashboard/history"
                    className="app-row"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: "10px 12px",
                      border: "1px solid var(--app-line)",
                      borderRadius: 10,
                    }}
                  >
                    <Badge tone={o.feasible ? "good" : "bad"}>{o.feasible ? "Feasible" : "Shortage"}</Badge>
                    <strong>{o.colorName}</strong>
                    <span className="app-muted" style={{ fontSize: 13 }}>{o.variantName}</span>
                    <span className="app-spacer" />
                    <span className="app-mono" style={{ fontSize: 12, color: "var(--app-faint)" }}>
                      {fmtDate(o.createdAt)}
                    </span>
                    <span className="app-mono" style={{ fontSize: 13, color: "var(--app-accent)", whiteSpace: "nowrap" }}>
                      {fmtINR(o.customerPrice)}
                    </span>
                    <ArrowRight size={14} color="var(--app-faint)" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="app-grid cols-2">
            {[
              { to: "/dashboard/materials", icon: Boxes, t: "Inventory Tracking", d: "Log raw materials, stock levels and unit prices." },
              { to: "/dashboard/formulas", icon: Palette, t: "Formula Management", d: "Build color recipes with per-batch material ratios." },
              { to: "/dashboard/production", icon: Factory, t: "Feasibility & Costing", d: "Check stock sufficiency and price a customer quote." },
              { to: "/dashboard/history", icon: History, t: "Order History", d: "Every saved run with its full cost breakdown." },
            ].map((c) => (
              <Link key={c.to} to={c.to} className="app-stat" style={{ gap: 8 }}>
                <c.icon size={20} color="var(--app-accent)" />
                <strong style={{ fontSize: 15 }}>{c.t}</strong>
                <span className="app-stat-hint">{c.d}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
