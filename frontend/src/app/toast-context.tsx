import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

type ToastPayload = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = ToastPayload & {
  id: string;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function variantIcon(variant: ToastVariant) {
  if (variant === "success") {
    return <CheckCircle2 className="size-5 text-emerald-600" />;
  }

  if (variant === "error") {
    return <AlertCircle className="size-5 text-rose-600" />;
  }

  return <Info className="size-5 text-primary" />;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (payload: ToastPayload) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next: ToastItem = {
        id,
        variant: payload.variant ?? "info",
        title: payload.title,
        description: payload.description,
        durationMs: payload.durationMs ?? 2800,
      };

      setToasts((current) => [...current, next]);

      window.setTimeout(() => {
        removeToast(id);
      }, next.durationMs);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-4 right-4 z-120 flex w-[min(92vw,380px)] flex-col gap-3 sm:bottom-6 sm:right-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "pointer-events-auto rounded-2xl border bg-white/95 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur",
                toast.variant === "success" && "border-emerald-200",
                toast.variant === "error" && "border-rose-200",
                toast.variant === "info" && "border-primary/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {variantIcon(toast.variant ?? "info")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {toast.description}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
