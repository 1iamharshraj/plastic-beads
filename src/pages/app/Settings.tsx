import { useEffect, useState } from "react";
import { Download, LogOut, Save, Settings as SettingsIcon } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Btn, Card, Field, Input, Skeleton, fmtINR } from "@/components/app/ui";
import { useToast } from "@/components/app/Toast";

export default function Settings() {
  const toast = useToast();
  const { user, logout } = useAuth();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const [fixedCost, setFixedCost] = useState("");
  const [profit, setProfit] = useState("");
  const [errors, setErrors] = useState<{ fixed?: string; profit?: string }>({});

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (settings) {
      setFixedCost(String(settings.fixedCostPerKg));
      setProfit(String(settings.profitPercent));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [settings]);

  const update = trpc.settings.update.useMutation({
    onSuccess: () => toast("good", "Factory settings saved."),
    onError: (e) => toast("bad", e.message),
  });

  const exportAll = trpc.settings.exportAll.useQuery({} as never, { enabled: false });

  const save = () => {
    const fc = Number(fixedCost);
    const pf = Number(profit);
    const e: typeof errors = {};
    if (fixedCost === "" || Number.isNaN(fc) || fc < 0) e.fixed = "Enter a number ≥ 0";
    if (profit === "" || Number.isNaN(pf) || pf < 0) e.profit = "Enter a number ≥ 0";
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    update.mutate({ fixedCostPerKg: fc, profitPercent: pf });
  };

  const downloadJson = async () => {
    try {
      const data = await exportAll.refetch();
      if (!data.data) throw new Error("No data");
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beadfactory-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast("good", "Export downloaded.");
    } catch {
      toast("bad", "Export failed — try again.");
    }
  };

  return (
    <>
      <header className="app-page-head">
        <div>
          <p className="app-kicker">Configuration</p>
          <h1 className="app-title">Settings</h1>
          <p className="app-sub">Costing defaults, data export and account.</p>
        </div>
      </header>

      {isLoading ? (
        <div className="app-stack"><Skeleton h={180} /><Skeleton h={120} /></div>
      ) : (
        <div className="app-stack" style={{ maxWidth: 720 }}>
          <Card title="Factory costing">
            <div className="app-stack">
              <div className="app-form-grid">
                <Field label="Fixed production cost per kg (₹)" error={errors.fixed}>
                  <Input type="number" min="0" step="any" inputMode="decimal" value={fixedCost}
                    onChange={(e) => setFixedCost(e.target.value)} placeholder="e.g. 15" />
                </Field>
                <Field label="Default profit margin (%)" error={errors.profit}>
                  <Input type="number" min="0" step="any" inputMode="decimal" value={profit}
                    onChange={(e) => setProfit(e.target.value)} placeholder="e.g. 22" />
                </Field>
              </div>
              <p className="app-muted" style={{ margin: 0, fontSize: 13 }}>
                Every production check prices as: materials + {fmtINR(Number(fixedCost) || 0)}/kg fixed,
                plus {Number(profit) || 0}% margin on top.
              </p>
              <div className="app-row">
                <span className="app-spacer" />
                <Btn onClick={save} disabled={update.isPending}>
                  <Save size={15} /> {update.isPending ? "Saving…" : "Save settings"}
                </Btn>
              </div>
            </div>
          </Card>

          <Card title="Data export">
            <div className="app-row">
              <p className="app-muted" style={{ margin: 0, fontSize: 13.5, flex: 1, minWidth: 200 }}>
                Download everything — materials, formulas, production orders and settings — as a single JSON file.
              </p>
              <Btn variant="ghost" onClick={downloadJson} disabled={exportAll.isFetching}>
                <Download size={15} /> {exportAll.isFetching ? "Preparing…" : "Download JSON"}
              </Btn>
            </div>
          </Card>

          <Card title="Account">
            <div className="app-row">
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ fontSize: 14.5 }}>{user?.name ?? "Factory user"}</strong>
                <p className="app-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                  {user?.email ?? ""} · manage your password from the sign-in page
                </p>
              </div>
              <Btn variant="danger" onClick={() => logout()}>
                <LogOut size={15} /> Log out
              </Btn>
            </div>
          </Card>

          <p className="app-muted" style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <SettingsIcon size={13} /> BeadFactory Pro — data is stored in the cloud and syncs across your devices.
          </p>
        </div>
      )}
    </>
  );
}
