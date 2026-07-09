import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  slideIcon?: ReactNode;
}

const base =
  "relative overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  primary: "text-white border-none",
  secondary: "border backdrop-blur-lg",
  tertiary: "border backdrop-blur-sm",
  danger: "text-white border-none",
};

const variantStyle: Record<string, React.CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, var(--accent), var(--accent-hover))",
    boxShadow: "0 4px 16px var(--accent-glow)",
  },
  secondary: {
    background: "var(--card-bg)",
    borderColor: "var(--card-border)",
    color: "var(--text-primary)",
  },
  tertiary: {
    background: "rgba(255,255,255,0.03)",
    borderColor: "var(--select-border)",
    color: "var(--text-muted)",
  },
  danger: {
    background: "linear-gradient(135deg, #B91C1C, #991B1B)",
    boxShadow: "0 4px 16px rgba(185,28,28,0.35)",
  },
};

const slideOverlay: Record<string, string> = {
  primary: "rgba(0,0,0,0.15)",
  secondary: "var(--accent-glow)",
  tertiary: "rgba(255,255,255,0.04)",
  danger: "rgba(255,255,255,0.15)",
};

export function Button({
  variant = "primary",
  slideIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`group ${base} ${variants[variant]} ${className ?? ""}`}
      style={variantStyle[variant]}
      {...props}
    >
      {slideIcon ? (
        <>
          <span className="inline-block transition-all duration-500 group-hover:opacity-0 group-hover:translate-x-4">
            {children}
          </span>
          <span
            className="absolute inset-0 z-10 grid place-items-center rounded-xl opacity-0 transition-all duration-500 group-hover:opacity-100"
            style={{ background: slideOverlay[variant] }}
          >
            <span className="scale-0 transition-transform duration-500 group-hover:scale-100">
              {slideIcon}
            </span>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
