import { useMemo, useState } from "react";
import { ChevronDown, Palette, Plus, Pencil, Trash2, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge, Btn, EmptyState, Field, Input, Modal, Select, Skeleton, fmtQty } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";
import type { MaterialUnit } from "@contracts/constants";

type ItemRow = { materialId: number | ""; quantity: string };

type BuilderState = {
  mode: "new-color" | "new-variant" | "edit-variant";
  formulaId?: number;
  variantId?: number;
  colorName: string;
  variantName: string;
  items: ItemRow[];
};

type FormulaList = NonNullable<ReturnType<typeof useFormulas>["data"]>;
function useFormulas() {
  return trpc.formulas.list.useQuery();
}
type Formula = FormulaList[number];
type Variant = Formula["variants"][number];

const emptyItems = (): ItemRow[] => [{ materialId: "", quantity: "" }];

/* Pick a stable swatch color from the color name. */
function swatchFor(name: string): string {
  const palette = ["#f2a33c", "#e11d48", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default function Formulas() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data: formulas, isLoading } = useFormulas();
  const { data: materials } = trpc.materials.list.useQuery();

  const [openIds, setOpenIds] = useState<Set<number>>(new Set());
  const [builder, setBuilder] = useState<BuilderState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteVariant, setDeleteVariant] = useState<Variant | null>(null);
  const [deleteFormula, setDeleteFormula] = useState<Formula | null>(null);

  const invalidate = () => utils.formulas.list.invalidate();

  const create = trpc.formulas.create.useMutation({
    onSuccess: () => { toast("good", "Formula saved."); setBuilder(null); invalidate(); },
    onError: (e) => toast("bad", e.message),
  });
  const updateVariant = trpc.formulas.updateVariant.useMutation({
    onSuccess: () => { toast("good", "Variant updated."); setBuilder(null); invalidate(); },
    onError: (e) => toast("bad", e.message),
  });
  const delVariant = trpc.formulas.deleteVariant.useMutation({
    onSuccess: () => { toast("good", "Variant deleted."); setDeleteVariant(null); invalidate(); },
    onError: (e) => { toast("bad", e.message); setDeleteVariant(null); },
  });
  const delFormula = trpc.formulas.deleteFormula.useMutation({
    onSuccess: () => { toast("good", "Color and all its variants deleted."); setDeleteFormula(null); invalidate(); },
    onError: (e) => { toast("bad", e.message); setDeleteFormula(null); },
  });

  const toggle = (id: number) =>
    setOpenIds((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const openNewColor = () => {
    setBuilder({ mode: "new-color", colorName: "", variantName: "Standard", items: emptyItems() });
    setErrors({});
  };
  const openNewVariant = (f: Formula) => {
    setBuilder({ mode: "new-variant", formulaId: f.id, colorName: f.colorName, variantName: "", items: emptyItems() });
    setErrors({});
  };
  const openEditVariant = (f: Formula, v: Variant) => {
    setBuilder({
      mode: "edit-variant",
      formulaId: f.id,
      variantId: v.id,
      colorName: f.colorName,
      variantName: v.variantName,
      items: v.items.map((i) => ({ materialId: i.materialId, quantity: String(i.quantity) })),
    });
    setErrors({});
  };

  const validateBuilder = (b: BuilderState): Record<string, string> => {
    const e: Record<string, string> = {};
    if (b.mode === "new-color" && !b.colorName.trim()) e.colorName = "Color name is required";
    if (!b.variantName.trim()) e.variantName = "Variant name is required";
    const valid = b.items.filter((i) => i.materialId !== "");
    if (valid.length === 0) e.items = "Add at least one material";
    valid.forEach((i, idx) => {
      const q = Number(i.quantity);
      if (i.quantity === "" || Number.isNaN(q) || q <= 0) e[`item-${idx}`] = "Ratio must be a number > 0";
    });
    return e;
  };

  const submitBuilder = () => {
    if (!builder) return;
    const e = validateBuilder(builder);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const items = builder.items
      .filter((i) => i.materialId !== "")
      .map((i) => ({ materialId: Number(i.materialId), quantity: Number(i.quantity) }));
    if (builder.mode === "edit-variant") {
      updateVariant.mutate({ variantId: builder.variantId!, variantName: builder.variantName.trim(), items });
    } else {
      create.mutate({
        formulaId: builder.mode === "new-variant" ? builder.formulaId : undefined,
        colorName: builder.mode === "new-color" ? builder.colorName.trim() : undefined,
        variantName: builder.variantName.trim(),
        items,
      });
    }
  };

  const saving = create.isPending || updateVariant.isPending;
  const materialName = useMemo(() => {
    const map = new Map((materials ?? []).map((m) => [m.id, m]));
    return map;
  }, [materials]);

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Recipes</p>
          <h1 className="app-title">Color Formulas</h1>
          <p className="app-sub">
            Each color holds variants (Standard, Premium, Economy…); each variant is a list of materials with per-batch ratios.
          </p>
        </div>
        <Btn onClick={openNewColor} disabled={(materials ?? []).length === 0}>
          <Plus size={16} /> New formula
        </Btn>
      </header>

      {(materials ?? []).length === 0 && !isLoading && (
        <p className="app-muted" style={{ marginTop: -8, marginBottom: 14, fontSize: 13 }}>
          Add raw materials first — formulas are built from your inventory.
        </p>
      )}

      {isLoading ? (
        <div className="app-stack"><Skeleton h={64} /><Skeleton h={64} /><Skeleton h={64} /></div>
      ) : (formulas ?? []).length === 0 ? (
        <EmptyState
          glyph={<Palette size={24} />}
          title="No color formulas yet"
          body="Create your first color recipe: pick materials from inventory and set their ratio per batch."
          action={(materials ?? []).length > 0 ? <Btn onClick={openNewColor}><Plus size={16} /> New formula</Btn> : undefined}
        />
      ) : (
        <div>
          {(formulas ?? []).map((f) => {
            const open = openIds.has(f.id);
            return (
              <div className="app-acc" key={f.id}>
                <button className="app-acc-head" onClick={() => toggle(f.id)} aria-expanded={open}>
                  <span className="app-acc-swatch" style={{ background: swatchFor(f.colorName) }} />
                  <span className="app-acc-name">{f.colorName}</span>
                  <span className="app-acc-meta">{f.variants.length} VARIANT{f.variants.length === 1 ? "" : "S"}</span>
                  <ChevronDown className="app-acc-chev" size={17} />
                </button>
                {open && (
                  <div className="app-acc-body">
                    {f.variants.map((v) => (
                      <div className="app-variant-block" key={v.id}>
                        <div className="app-variant-head">
                          <span className="app-variant-name">{v.variantName}</span>
                          <Badge tone="dim">{v.items.length} materials</Badge>
                          <Btn variant="ghost" size="sm" onClick={() => openEditVariant(f, v)}><Pencil size={13} /> Edit</Btn>
                          <Btn variant="danger" size="sm" onClick={() => setDeleteVariant(v)}><Trash2 size={13} /></Btn>
                        </div>
                        <div className="app-table-wrap" style={{ border: "none", borderRadius: 0 }}>
                          <table className="app-table" style={{ minWidth: 420 }}>
                            <thead>
                              <tr><th>Material</th><th>Ratio / batch</th><th>Unit</th></tr>
                            </thead>
                            <tbody>
                              {v.items.map((i) => (
                                <tr key={i.id}>
                                  <td>{i.material?.name ?? "(deleted material)"}</td>
                                  <td className="num">{fmtQty(i.quantity)}</td>
                                  <td className="app-muted">{i.material?.unit ?? "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                    <div className="app-row">
                      <Btn variant="ghost" size="sm" onClick={() => openNewVariant(f)}>
                        <Plus size={14} /> Add variant
                      </Btn>
                      <span className="app-spacer" />
                      <Btn variant="danger" size="sm" onClick={() => setDeleteFormula(f)}>
                        <Trash2 size={13} /> Delete color
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {builder && (
        <Modal
          wide
          title={
            builder.mode === "new-color"
              ? "New color formula"
              : builder.mode === "new-variant"
                ? `New variant — ${builder.colorName}`
                : `Edit variant — ${builder.colorName}`
          }
          onClose={() => setBuilder(null)}
        >
          <div className="app-stack">
            <div className="app-form-grid">
              {builder.mode === "new-color" && (
                <Field label="Color name" error={errors.colorName}>
                  <Input value={builder.colorName} autoFocus
                    onChange={(e) => setBuilder({ ...builder, colorName: e.target.value })}
                    placeholder="e.g. Midnight Blue" />
                </Field>
              )}
              <Field label="Variant name" error={errors.variantName}>
                <Input value={builder.variantName}
                  onChange={(e) => setBuilder({ ...builder, variantName: e.target.value })}
                  placeholder="Standard / Premium / Economy" />
              </Field>
            </div>

            <div>
              <p className="app-label" style={{ marginBottom: 10 }}>Materials (ratio per batch)</p>
              <div className="app-stack" style={{ gap: 10 }}>
                {builder.items.map((row, idx) => {
                  const mat = row.materialId !== "" ? materialName.get(Number(row.materialId)) : undefined;
                  return (
                    <div className="app-item-row" key={idx}>
                      <Field label={idx === 0 ? "Material" : ""}>
                        <Select
                          value={row.materialId}
                          onChange={(e) => {
                            const items = [...builder.items];
                            items[idx] = { ...row, materialId: e.target.value === "" ? "" : Number(e.target.value) };
                            setBuilder({ ...builder, items });
                          }}
                        >
                          <option value="">Select material…</option>
                          {(materials ?? []).map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label={idx === 0 ? "Ratio qty" : ""} error={errors[`item-${idx}`]}>
                        <Input type="number" min="0" step="any" inputMode="decimal" placeholder="0"
                          value={row.quantity}
                          onChange={(e) => {
                            const items = [...builder.items];
                            items[idx] = { ...row, quantity: e.target.value };
                            setBuilder({ ...builder, items });
                          }} />
                      </Field>
                      <Field label={idx === 0 ? "Unit" : ""}>
                        <Input value={mat ? (mat.unit as MaterialUnit) : "—"} readOnly disabled aria-label="Unit (from material)" />
                      </Field>
                      <button
                        className="app-icon-btn"
                        aria-label="Remove material row"
                        onClick={() => setBuilder({ ...builder, items: builder.items.filter((_, i) => i !== idx) })}
                        disabled={builder.items.length === 1}
                        style={builder.items.length === 1 ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {errors.items && <p className="app-field-error" style={{ marginTop: 8 }}>{errors.items}</p>}
              <div style={{ marginTop: 12 }}>
                <Btn variant="ghost" size="sm"
                  onClick={() => setBuilder({ ...builder, items: [...builder.items, { materialId: "", quantity: "" }] })}>
                  <Plus size={14} /> Add another material
                </Btn>
              </div>
            </div>

            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setBuilder(null)}>Cancel</Btn>
              <Btn onClick={submitBuilder} disabled={saving}>{saving ? "Saving…" : "Save formula"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleteVariant && (
        <Modal title="Delete variant?" onClose={() => setDeleteVariant(null)}>
          <div className="app-stack">
            <p className="app-muted" style={{ margin: 0 }}>
              Variant <strong style={{ color: "var(--app-ink)" }}>{deleteVariant.variantName}</strong> and its material
              breakdown will be deleted. Saved production orders keep their cost snapshots.
            </p>
            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setDeleteVariant(null)}>Keep it</Btn>
              <Btn variant="danger" disabled={delVariant.isPending}
                onClick={() => delVariant.mutate({ variantId: deleteVariant.id })}>
                {delVariant.isPending ? "Deleting…" : "Delete"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {deleteFormula && (
        <Modal title={`Delete ${deleteFormula.colorName}?`} onClose={() => setDeleteFormula(null)}>
          <div className="app-stack">
            <p className="app-muted" style={{ margin: 0 }}>
              This deletes the color <strong style={{ color: "var(--app-ink)" }}>{deleteFormula.colorName}</strong> and
              all {deleteFormula.variants.length} of its variants. Saved production orders keep their cost snapshots.
            </p>
            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setDeleteFormula(null)}>Keep it</Btn>
              <Btn variant="danger" disabled={delFormula.isPending}
                onClick={() => delFormula.mutate({ formulaId: deleteFormula.id })}>
                {delFormula.isPending ? "Deleting…" : "Delete color"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
