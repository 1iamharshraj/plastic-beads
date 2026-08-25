import { useMemo, useState } from "react";
import { Boxes, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Badge, Btn, EmptyState, Field, Input, Modal, Select, Skeleton, fmtINR, fmtQty } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";
import { MATERIAL_UNITS, type MaterialUnit } from "@contracts/constants";
import type { RawMaterial } from "@contracts/types";

type FormState = {
  name: string;
  unit: MaterialUnit;
  quantity: string;
  pricePerUnit: string;
};

const emptyForm: FormState = { name: "", unit: "kg", quantity: "", pricePerUnit: "" };

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!f.name.trim()) e.name = "Name is required";
  const q = Number(f.quantity);
  const p = Number(f.pricePerUnit);
  if (f.quantity === "" || Number.isNaN(q)) e.quantity = "Enter a number";
  else if (q < 0) e.quantity = "Cannot be negative";
  if (f.pricePerUnit === "" || Number.isNaN(p)) e.pricePerUnit = "Enter a number";
  else if (p < 0) e.pricePerUnit = "Cannot be negative";
  return e;
}

export default function Materials() {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data: materials, isLoading } = trpc.materials.list.useQuery();

  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<null | { editing?: RawMaterial }>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmDelete, setConfirmDelete] = useState<RawMaterial | null>(null);

  const invalidate = () => utils.materials.list.invalidate();

  const create = trpc.materials.create.useMutation({
    onSuccess: () => { toast("good", "Material added."); setModal(null); invalidate(); },
    onError: (e) => toast("bad", e.message),
  });
  const update = trpc.materials.update.useMutation({
    onSuccess: () => { toast("good", "Material updated."); setModal(null); invalidate(); },
    onError: (e) => toast("bad", e.message),
  });
  const remove = trpc.materials.remove.useMutation({
    onSuccess: () => { toast("good", "Material deleted."); setConfirmDelete(null); invalidate(); },
    onError: (e) => { toast("bad", e.message); setConfirmDelete(null); },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (materials ?? []).filter((m) => !q || m.name.toLowerCase().includes(q));
  }, [materials, query]);

  const openCreate = () => { setForm(emptyForm); setErrors({}); setModal({}); };
  const openEdit = (m: RawMaterial) => {
    setForm({ name: m.name, unit: m.unit, quantity: String(m.quantity), pricePerUnit: String(m.pricePerUnit) });
    setErrors({});
    setModal({ editing: m });
  };

  const submit = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const payload = {
      name: form.name.trim(),
      unit: form.unit,
      quantity: Number(form.quantity),
      pricePerUnit: Number(form.pricePerUnit),
    };
    if (modal?.editing) update.mutate({ id: modal.editing.id, data: payload });
    else create.mutate(payload);
  };

  const totalValue = (materials ?? []).reduce((s, m) => s + m.quantity * m.pricePerUnit, 0);
  const saving = create.isPending || update.isPending;

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Inventory</p>
          <h1 className="app-title">Raw Materials</h1>
          <p className="app-sub">
            {(materials ?? []).length} materials · total stock value {fmtINR(totalValue)}
          </p>
        </div>
        <Btn onClick={openCreate}><Plus size={16} /> Add material</Btn>
      </header>

      <div className="app-row" style={{ marginBottom: 16 }}>
        <div className="app-search">
          <Search />
          <Input
            placeholder="Search materials…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search materials"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="app-stack"><Skeleton h={52} /><Skeleton h={52} /><Skeleton h={52} /><Skeleton h={52} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          glyph={<Boxes size={24} />}
          title={query ? "No materials match your search" : "No raw materials yet"}
          body={query ? "Try a different name." : "Add your first raw material — granules, masterbatch, additives — with stock quantity and unit price."}
          action={!query ? <Btn onClick={openCreate}><Plus size={16} /> Add material</Btn> : undefined}
        />
      ) : (
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Name</th><th>Qty available</th><th>Unit</th><th>Price / unit</th><th>Total value</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.name}</strong></td>
                  <td className="num">{fmtQty(m.quantity)}</td>
                  <td><Badge tone="dim">{m.unit}</Badge></td>
                  <td className="num">{fmtINR(m.pricePerUnit)}</td>
                  <td className="num" style={{ color: "var(--app-accent)" }}>{fmtINR(m.quantity * m.pricePerUnit)}</td>
                  <td>
                    <div className="row-actions">
                      <Btn variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={13} /> Edit</Btn>
                      <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(m)}><Trash2 size={13} /> Delete</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.editing ? "Edit material" : "Add material"} onClose={() => setModal(null)}>
          <div className="app-stack">
            <Field label="Material name" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. PP Granules (White Base)"
                autoFocus
              />
            </Field>
            <div className="app-form-grid">
              <Field label="Unit">
                <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as MaterialUnit })}>
                  {MATERIAL_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </Select>
              </Field>
              <Field label="Quantity available" error={errors.quantity}>
                <Input type="number" min="0" step="any" inputMode="decimal" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </Field>
              <Field label="Price per unit (₹)" error={errors.pricePerUnit}>
                <Input type="number" min="0" step="any" inputMode="decimal" value={form.pricePerUnit}
                  onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} placeholder="0.00" />
              </Field>
            </div>
            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn onClick={submit} disabled={saving}>{saving ? "Saving…" : modal.editing ? "Save changes" : "Add material"}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete material?" onClose={() => setConfirmDelete(null)}>
          <div className="app-stack">
            <p className="app-muted" style={{ margin: 0 }}>
              <strong style={{ color: "var(--app-ink)" }}>{confirmDelete.name}</strong> will be removed from inventory.
              This cannot be undone. Materials used in a formula cannot be deleted.
            </p>
            <div className="app-row">
              <span className="app-spacer" />
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Keep it</Btn>
              <Btn variant="danger" onClick={() => remove.mutate({ id: confirmDelete.id })} disabled={remove.isPending}>
                {remove.isPending ? "Deleting…" : "Delete"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
