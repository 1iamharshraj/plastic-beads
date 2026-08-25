import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

/* Captures the PWA install event and shows a small install chip.
 * Chrome/Edge fire `beforeinstallprompt`; iOS Safari gets a hint instead. */

type BIPEvent = Event & { prompt: () => Promise<void> };

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = window.navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIos && !standalone) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (dismissed || (!deferred && !iosHint)) return null;

  return (
    <div
      role="dialog"
      aria-label="Install BeadFactory Pro"
      style={{
        position: "fixed",
        zIndex: 80,
        left: 14,
        bottom: "calc(14px + env(safe-area-inset-bottom))",
        maxWidth: 320,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 14,
        background: "rgba(14, 17, 20, 0.92)",
        border: "1px solid rgba(242, 163, 60, 0.45)",
        color: "#e8edf2",
        fontSize: 13,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
      }}
    >
      <Download size={17} color="#f2a33c" style={{ flex: "none" }} />
      <span style={{ flex: 1 }}>
        {deferred
          ? "Install BeadFactory Pro for one-tap access and offline viewing."
          : "Add BeadFactory to your Home Screen: Share → Add to Home Screen."}
      </span>
      {deferred && (
        <button
          className="app-btn app-btn-primary app-btn-sm"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install
        </button>
      )}
      <button
        aria-label="Dismiss install prompt"
        onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", color: "#5b6672", cursor: "pointer", padding: 4 }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
