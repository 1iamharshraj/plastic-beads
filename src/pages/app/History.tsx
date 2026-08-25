import { useMemo, useState } from "react";
import { History as HistoryIcon, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge, Btn, EmptyState, Field, Input, Modal, Select, Skeleton, fmtDate, fmtINR, fmtQty } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";
import type { ProductionOrder } from "@contracts/types";

type FeasFilter = "all" | "feasible" | "shortage";

export default function History() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.production.list.useQuery();

  const [colorFilter, setColorFilter] = useState("all");
  const [feasFilter, setFeasFilter] = useState<FeasFilter>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<ProductionOrder | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ProductionOrder | null>(null);

  const remove = trpc.production.remove.useMutation({
    onSuccess: () => { toast("good", "Order deleted."); setConfirmDelete(null); setDetail(null); utils.production.list.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (e) => { toast("bad", e.message); setConfirmDelete(null); },
  });

  const colors = useMemo(
    () => [...new Set((orders ?? []).map((o) => o.colorName))].sort(),
    [orders],
  );

  const filtered = useMemo(() => {
    return (orders ?? []).filter((o) => {
      if (colorFilter !== "all" && o.colorName !== colorFilter) return false;
      if (feasFilter === "feasible" && !o.feasible) return false;
      if (feasFilter === "shortage" && o.feasible) return false;
      const d = new Date(o.createdAt);
      if (from && d < new Date(from + "T00:00:00")) return false;
      if (to && d > new Date(to + "T23:59:59")) return false;
      return true;
    });
  }, [orders, colorFilter, feasFilter, from, to]);

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Archive</p>
          <h1 className="app-title">Production History</h1>
          <p className="app-sub">{(orders ?? []).length} saved orders with full cost snapshots.</p>
        </div>
      </header>

      <div className="app-form-grid" style={{ marginBottom: 16 }}>
        <Field label="Color">
          <Select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
            <option value="all">All colors</option>
            {colors.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Feasibility">
          <Select value={feasFilter} onChange={(e) => setFeasFilter(e.target.value as FeasFilter)}>
            <option value="all">All</option>
            <option value="feasible">Feasible</option>
            <option value="shortage">Shortage</option>
          </Select>
        </Field>
        <Field label="From">
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>

      {isLoading ? (
        <div className="app-stack"><Skeleton h={52} /><Skeleton h={52} /><Skeleton h={52} /><Skeleton h={52} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          glyph={<HistoryIcon size={24} />}
          title={(orders ?? []).length === 0 ? "No production orders yet" : "Nothing matches the filters"}
          body={(orders ?? []).length === 0
            ? "Run a feasibility check in Production and save the order — it will appear here."
            : "Try widening the date range or clearing the color filter."}
        />
      ) : (
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Date</th><th>Color</th><th>Variant</th><th>Required qty</th>
                <th>Feasible</th><th>Total cost</th><th>Customer price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => setDetail(o)} style={{ cursor: "pointer" }}>
                  <td className="num">{fmtDate(o.createdAt)}</td>
                  <td><strong>{o.colorName}</strong></td>
                  <td className="app-muted">{o.variantName}</td>
                  <td className="num">{fmtQty(o.requiredQty)} kg</td>
                  <td><Badge tone={o.feasible ? "good" : "bad"}>{o.feasible ? "Yes" : "Shortage"}</Badge></td>
                  <td className="num">{fmtINR(o.totalCost)}</td>
                  <td className="num" style={{ color: "var(--app-accent)" }}>{fmtINR(o.customerPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <Modal wide title={`${detail.colorName} — ${detail.variantName}`} onClose={() => setDetail(null)}>
          <div className="app-stack">
            <div className="app-row">
              <Badge tone={detail.feasible ? "good" : "bad"}>{detail.feasible ? "CAN PRODUCE" : "CANNOT PRODUCE"}</Badge>
              <span className="app-muted" style={{ fontSize: 13 }}>
                {fmtDate(detail.createdAt)} · {fmtQty(detail.requiredQty)} kg
              </span>
            </div>

            {detail.shortageDetails && detail.shortageDetails.length > 0 && (
              <div className="app-card" style={{ borderColor: "rgba(248,113,113,0.35)", padding: 14 }}>
                <h3 className="app-card-title" style={{ color: "var(--app-bad)" }}>Shortages</h3>
                {detail.shortageDetails.map((s) => (
                  <div key={s.materialId} className="app-row" style={{ fontSize: 13.5, padding: "3px 0" }}>
                    <span>{s.materialName}</span>
                    <span className="app-spacer" />
                    <span className="app-mono" style={{ color: "var(--app-bad)" }}>short {fmtQty(s.shortBy)} {s.unit}</span>
                  </div>
                ))}
              </div>
            )}

            {detail.breakdown && detail.breakdown.length > 0 && (
              <div className="app-table-wrap">
                <table className="app-table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr><th>Material</th><th>Required</th><th>Available</th><th>Status</th><th>Cost</th></tr>
                  </thead>
                  <tbody>
                    {detail.breakdown.map((b) => (
                      <tr key={b.materialId}>
                        <td>{b.materialName}</td>
                        <td className="num">{fmtQty(b.needed)} {b.unit}</td>
                        <td className="num">{fmtQty(b.available)} {b.unit}</td>
                        <td><Badge tone={b.sufficient ? "good" : "bad"}>{b.sufficient ? "OK" : "Short"}</Badge></td>
                        <td className="num">{fmtINR(b.cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="app-cost-grid">
              <div className="app-cost-cell"><div className="k">Material cost</div><div className="v">{fmtINR(detail.materialCost)}</div></div>
              <div className="app-cost-cell"><div className="k">Fixed cost</div><div className="v">{fmtINR(detail.fixedCost)}</div></div>
              <div className="app-cost-cell"><div className="k">Total cost</div><div className="v">{fmtINR(detail.totalCost)}</div></div>
              <div className="app-cost-cell"><div className="k">Profit ({detail.profitPercent}%)</div><div className="v" style={{ color: "var(--app-good)" }}>+{fmtINR(detail.customerPrice - detail.totalCost)}</div></div>
            </div>

            <div className="app-price-hero">
              <div className="app-label">Customer estimate</div>
              <div className="amount">{fmtINR(detail.customerPrice)}</div>
            </div>

            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(detail)}><Trash2 size={13} /> Delete order</Btn>
              <Btn variant="ghost" onClick={() => setDetail(null)}>Close</Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete order?" onClose={() => setConfirmDelete(null)}>
          <div className="app-stack">
            <p className="app-muted" style={{ margin: 0 }}>
              The {confirmDelete.colorName} ({confirmDelete.variantName}) order from {fmtDate(confirmDelete.createdAt)} will be permanently removed.
            </p>
            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Btn>
              <Btn variant="danger" disabled={remove.isPending} onClick={() => remove.mutate({ id: confirmDelete.id })}>
                {remove.isPending ? "Deleting…" : "Delete"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
