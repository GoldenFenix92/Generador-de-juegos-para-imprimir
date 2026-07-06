import type { ButtonHTMLAttributes } from "react";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`glass-btn ${className ?? ""}`}
      {...props}
    />
  );
}
