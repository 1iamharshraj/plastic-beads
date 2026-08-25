import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type Toast = { id: number; kind: "good" | "bad"; text: string };

const ToastCtx = createContext<(kind: "good" | "bad", text: string) => void>(() => {});

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((kind: "good" | "bad", text: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="app-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`app-toast ${t.kind}`} role="status">
            {t.kind === "good" ? (
              <CheckCircle2 size={17} color="var(--app-good)" style={{ flex: "none", marginTop: 1 }} />
            ) : (
              <AlertTriangle size={17} color="var(--app-bad)" style={{ flex: "none", marginTop: 1 }} />
            )}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
