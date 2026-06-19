"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

const VARIANT_CONFIG: Record<
  ToastVariant,
  {
    icon: React.ElementType;
    border: string;
    bg: string;
    iconColor: string;
    progressColor: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-green-500/40",
    bg: "from-green-500/10 to-green-900/10",
    iconColor: "text-green-400",
    progressColor: "bg-green-400",
  },
  error: {
    icon: AlertCircle,
    border: "border-red-500/40",
    bg: "from-red-500/10 to-red-900/10",
    iconColor: "text-red-400",
    progressColor: "bg-red-400",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-yellow-500/40",
    bg: "from-yellow-500/10 to-yellow-900/10",
    iconColor: "text-yellow-400",
    progressColor: "bg-yellow-400",
  },
  info: {
    icon: Info,
    border: "border-blue-500/40",
    bg: "from-blue-500/10 to-blue-900/10",
    iconColor: "text-blue-400",
    progressColor: "bg-blue-400",
  },
};

const DEFAULT_DURATION = 4000;

function ToastItem({
  toast,
  onDismiss,
}: Readonly<{
  toast: Toast;
  onDismiss: (id: string) => void;
}>) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  const dismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss
    timerRef.current = setTimeout(dismiss, toast.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, toast.duration]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: isVisible && !isExiting ? 1 : 0,
        transform:
          isVisible && !isExiting
            ? "translateX(0) scale(1)"
            : "translateX(20px) scale(0.95)",
      }}
      className={`
        relative overflow-hidden
        w-80 max-w-[calc(100vw-2rem)]
        bg-gradient-to-r ${config.bg}
        backdrop-blur-xl
        bg-slate-900/90
        border ${config.border}
        rounded-xl
        shadow-2xl shadow-black/30
        pointer-events-auto
      `}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon size={20} className={`${config.iconColor} flex-shrink-0 mt-0.5`} />

        <p className="text-sm text-slate-200 flex-1 leading-relaxed">
          {toast.message}
        </p>

        <button
          onClick={dismiss}
          className="text-slate-400 hover:text-slate-200 transition-colors duration-200 flex-shrink-0 -mt-0.5 -mr-1 p-0.5 rounded hover:bg-white/5"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full bg-slate-800/50">
        <div
          className={`h-full ${config.progressColor} opacity-60`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, variant: ToastVariant, duration: number = DEFAULT_DURATION) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = React.useMemo(
    () => ({
      success: (msg, dur) => addToast(msg, "success", dur),
      error: (msg, dur) => addToast(msg, "error", dur),
      warning: (msg, dur) => addToast(msg, "warning", dur),
      info: (msg, dur) => addToast(msg, "info", dur),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>

      {/* Keyframe animation for the progress bar */}
      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
