import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Factory, FlaskConical, CheckCircle2, XCircle, Save } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge, Btn, EmptyState, Field, Input, Select, Skeleton, fmtINR, fmtQty } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";

type Analysis = Awaited<ReturnType<ReturnType<typeof trpc.production.check.useMutation>["mutateAsync"]>>;

export default function Production() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data: formulas, isLoading } = trpc.formulas.list.useQuery();

  const [colorId, setColorId] = useState<number | "">("");
  const [variantId, setVariantId] = useState<number | "">("");
  const [requiredQty, setRequiredQty] = useState("");
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);

  const selectedFormula = useMemo(
    () => (formulas ?? []).find((f) => f.id === colorId),
    [formulas, colorId],
  );

  const check = trpc.production.check.useMutation({
    onSuccess: (a) => setResult(a),
    onError: (e) => { setResult(null); toast("bad", e.message); },
  });
  const save = trpc.production.save.useMutation({
    onSuccess: async () => {
      toast("good", "Production order saved to history.");
      await utils.production.list.invalidate();
      await utils.dashboard.stats.invalidate();
    },
    onError: (e) => toast("bad", e.message),
  });

  const runCheck = () => {
    setFormError("");
    const qty = Number(requiredQty);
    if (variantId === "") return setFormError("Choose a color and variant first.");
    if (requiredQty === "" || Number.isNaN(qty) || qty <= 0)
      return setFormError("Required quantity must be a number greater than 0.");
    check.mutate({ variantId: Number(variantId), requiredQty: qty });
  };

  const saveOrder = () => {
    if (variantId === "" || !result) return;
    save.mutate({ variantId: Number(variantId), requiredQty: Number(requiredQty) });
  };

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Feasibility & Costing</p>
          <h1 className="app-title">Production Order</h1>
          <p className="app-sub">
            Pick a color formula and target output — we scale the recipe, check stock, and price the customer quote.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="app-stack"><Skeleton h={120} /><Skeleton h={220} /></div>
      ) : (formulas ?? []).length === 0 ? (
        <EmptyState
          glyph={<FlaskConical size={24} />}
          title="No formulas to run"
          body="Production checks need at least one color formula with materials."
          action={<Link to="/dashboard/formulas" className="app-btn app-btn-primary">Create a formula</Link>}
        />
      ) : (
        <div className="app-stack">
          <div className="app-card">
            <h3 className="app-card-title">Order input</h3>
            <div className="app-form-grid">
              <Field label="Color">
                <Select
                  value={colorId}
                  onChange={(e) => {
                    setColorId(e.target.value === "" ? "" : Number(e.target.value));
                    setVariantId("");
                    setResult(null);
                  }}
                >
                  <option value="">Select color…</option>
                  {(formulas ?? []).map((f) => (
                    <option key={f.id} value={f.id}>{f.colorName}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Variant">
                <Select
                  value={variantId}
                  disabled={colorId === ""}
                  onChange={(e) => {
                    setVariantId(e.target.value === "" ? "" : Number(e.target.value));
                    setResult(null);
                  }}
                >
                  <option value="">{colorId === "" ? "Pick a color first" : "Select variant…"}</option>
                  {(selectedFormula?.variants ?? []).map((v) => (
                    <option key={v.id} value={v.id}>{v.variantName}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Required quantity (kg)">
                <Input type="number" min="0" step="any" inputMode="decimal" placeholder="e.g. 50"
                  value={requiredQty}
                  onChange={(e) => { setRequiredQty(e.target.value); setResult(null); }} />
              </Field>
              <Btn onClick={runCheck} disabled={check.isPending}>
                <Factory size={16} /> {check.isPending ? "Analyzing…" : "Check feasibility & cost"}
              </Btn>
            </div>
            {formError && <p className="app-field-error" style={{ marginTop: 10 }}>{formError}</p>}
          </div>

          {result && (
            <div className="app-stack">
              <div className={`app-verdict ${result.feasible ? "good" : "bad"}`}>
                {result.feasible
                  ? <CheckCircle2 size={30} color="var(--app-good)" style={{ flex: "none" }} />
                  : <XCircle size={30} color="var(--app-bad)" style={{ flex: "none" }} />}
                <div>
                  <div className="app-verdict-stamp">{result.feasible ? "CAN PRODUCE" : "CANNOT PRODUCE"}</div>
                  <div className="app-muted" style={{ fontSize: 13 }}>
                    {result.colorName} · {result.variantName} · {fmtQty(result.requiredQty)} kg target
                  </div>
                </div>
                <span className="app-spacer" />
                <Badge tone={result.feasible ? "good" : "bad"}>
                  {result.feasible ? "All materials in stock" : `${result.shortages.length} shortage${result.shortages.length === 1 ? "" : "s"}`}
                </Badge>
              </div>

              {!result.feasible && (
                <div className="app-card" style={{ borderColor: "rgba(248,113,113,0.35)" }}>
                  <h3 className="app-card-title" style={{ color: "var(--app-bad)" }}>Material shortages</h3>
                  <div className="app-stack" style={{ gap: 8 }}>
                    {result.shortages.map((s) => (
                      <div key={s.materialId} className="app-row" style={{ fontSize: 14 }}>
                        <strong>{s.materialName}</strong>
                        <span className="app-spacer" />
                        <span className="app-mono" style={{ color: "var(--app-bad)", fontSize: 13 }}>
                          short by {fmtQty(s.shortBy)} {s.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="app-card">
                <h3 className="app-card-title">Material breakdown</h3>
                <div className="app-table-wrap" style={{ border: "none" }}>
                  <table className="app-table" style={{ minWidth: 620 }}>
                    <thead>
                      <tr><th>Material</th><th>Required</th><th>Available</th><th>Status</th><th>Cost</th></tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((b) => (
                        <tr key={b.materialId}>
                          <td>{b.materialName}</td>
                          <td className="num">{fmtQty(b.needed)} {b.unit}</td>
                          <td className="num">{fmtQty(b.available)} {b.unit}</td>
                          <td>
                            <Badge tone={b.sufficient ? "good" : "bad"}>{b.sufficient ? "OK" : "Short"}</Badge>
                          </td>
                          <td className="num">{fmtINR(b.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="app-cost-grid">
                <div className="app-cost-cell">
                  <div className="k">Raw material cost</div>
                  <div className="v">{fmtINR(result.materialCost)}</div>
                </div>
                <div className="app-cost-cell">
                  <div className="k">Fixed production cost</div>
                  <div className="v">{fmtINR(result.fixedCost)}</div>
                </div>
                <div className="app-cost-cell">
                  <div className="k">Total production cost</div>
                  <div className="v">{fmtINR(result.totalCost)}</div>
                </div>
                <div className="app-cost-cell">
                  <div className="k">Profit ({result.profitPercent}%)</div>
                  <div className="v" style={{ color: "var(--app-good)" }}>+{fmtINR(result.profitAmount)}</div>
                </div>
              </div>

              <div className="app-price-hero">
                <div className="app-label">Customer estimate</div>
                <div className="amount">{fmtINR(result.customerPrice)}</div>
                <div className="app-muted" style={{ fontSize: 13 }}>
                  for {fmtQty(result.requiredQty)} kg of {result.colorName} ({result.variantName})
                </div>
              </div>

              <div className="app-row">
                <span className="app-spacer" />
                <Btn variant="ghost" onClick={() => setResult(null)}>Clear</Btn>
                <Btn onClick={saveOrder} disabled={save.isPending}>
                  <Save size={15} /> {save.isPending ? "Saving…" : "Save order to history"}
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
