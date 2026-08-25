import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { X } from "lucide-react";

/* Small design-system primitives for the dashboard, styled by
 * src/styles/dashboard.css (no external UI kit). */

export function Btn({
  variant = "primary",
  size,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm";
}) {
  return (
    <button
      className={`app-btn app-btn-${variant}${size === "sm" ? " app-btn-sm" : ""} ${className}`}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return <input ref={ref} className={`app-input ${className}`} {...props} />;
  },
);

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`app-select ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="app-field">
      <span className="app-label">{label}</span>
      {children}
      {error ? <span className="app-field-error">{error}</span> : null}
    </label>
  );
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="app-card">
      {title ? <h3 className="app-card-title">{title}</h3> : null}
      {children}
    </section>
  );
}

export function Badge({ tone = "dim", children }: { tone?: "good" | "bad" | "warn" | "dim"; children: ReactNode }) {
  return <span className={`app-badge app-badge-${tone}`}>{children}</span>;
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="app-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`app-modal${wide ? " app-modal-lg" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="app-row" style={{ marginBottom: 16 }}>
          <h2 className="app-title" style={{ fontSize: 22 }}>{title}</h2>
          <span className="app-spacer" />
          <button className="app-icon-btn" onClick={onClose} aria-label="Close dialog" style={{ height: 40 }}>
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({ h = 16, w = "100%" }: { h?: number; w?: number | string }) {
  return <div className="app-skeleton" style={{ height: h, width: w }} />;
}

export function EmptyState({
  glyph,
  title,
  body,
  action,
}: {
  glyph: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="app-empty">
      <div className="app-empty-glyph">{glyph}</div>
      <strong style={{ color: "var(--app-ink)" }}>{title}</strong>
      <span style={{ fontSize: 13.5, maxWidth: "46ch" }}>{body}</span>
      {action}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

// eslint-disable-next-line react-refresh/only-export-components
export const fmtQty = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(n);

// eslint-disable-next-line react-refresh/only-export-components
export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
