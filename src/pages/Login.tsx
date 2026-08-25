import { Gem, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Btn, Field, Input } from "@/components/app/ui";

export default function Login() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function formatError(message: string) {
    if (message.includes("Unexpected token") || message.includes("not valid JSON")) {
      return "A server error occurred. Please check your connection or try again later.";
    }
    return message;
  }

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => setError(formatError(e.message)),
  });
  const register = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate("/dashboard");
    },
    onError: (e) => setError(formatError(e.message)),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, name: name || undefined });
    }
  };

  if (user) {
    return (
      <div
        className="app-root"
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: "100dvh",
          padding: 20,
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(242,163,60,0.09), transparent 70%), var(--app-canvas)",
        }}
      >
        <div className="app-card" style={{ width: "min(420px, 100%)", padding: 34, textAlign: "center" }}>
          <span
            className="app-brand-gem"
            style={{ width: 46, height: 46, borderRadius: 13, margin: "0 auto 18px", display: "grid" }}
          >
            <Gem size={21} />
          </span>
          <p className="app-kicker" style={{ marginBottom: 8 }}>BeadFactory Pro</p>
          <h1 className="app-title" style={{ fontSize: 26, marginBottom: 10 }}>
            Welcome back, {user.name ?? "maker"}
          </h1>
          <Link to="/dashboard" className="app-btn app-btn-primary" style={{ width: "100%" }}>
            Open dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const busy = login.isPending || register.isPending || authLoading;

  return (
    <div
      className="app-root"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100dvh",
        padding: 20,
        background:
          "radial-gradient(60% 50% at 50% 0%, rgba(242,163,60,0.09), transparent 70%), var(--app-canvas)",
      }}
    >
      <div className="app-card" style={{ width: "min(420px, 100%)", padding: 34 }}>
        <span
          className="app-brand-gem"
          style={{ width: 46, height: 46, borderRadius: 13, margin: "0 auto 18px", display: "grid" }}
        >
          <Gem size={21} />
        </span>
        <p className="app-kicker" style={{ marginBottom: 8, textAlign: "center" }}>BeadFactory Pro</p>
        <h1 className="app-title" style={{ fontSize: 26, marginBottom: 10, textAlign: "center" }}>
          {mode === "login" ? "Sign in to your factory" : "Create your factory account"}
        </h1>
        <p className="app-muted" style={{ fontSize: 13.5, margin: "0 0 24px", textAlign: "center" }}>
          Inventory, color formulas, feasibility and pricing — one account, every device.
        </p>

        <form onSubmit={submit} className="app-stack" style={{ gap: 14 }}>
          <Field label="Email" error={error}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </Field>
          {mode === "register" && (
            <Field label="Name (optional)">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </Field>
          )}
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </Field>

          {error && <p className="app-field-error" style={{ margin: 0 }}>{error}</p>}

          <Btn type="submit" disabled={busy} style={{ width: "100%", marginTop: 6 }}>
            {busy ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Btn>
        </form>

        <p className="app-muted" style={{ fontSize: 13, margin: "18px 0 0", textAlign: "center" }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            style={{ background: "none", border: "none", color: "var(--app-accent)", cursor: "pointer", padding: 0 }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>

        <p style={{ margin: "18px 0 0", fontSize: 12, textAlign: "center" }}>
          <Link to="/" style={{ color: "var(--app-faint)", textDecoration: "none" }}>
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
