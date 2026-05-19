import React, { useEffect } from "react";

/**
 * Modal — dark-theme dialog panel
 *
 * Props:
 *   open       boolean          — show/hide
 *   onClose    () => void       — close handler
 *   title      string           — header title
 *   subtitle   string?          — optional sub-title below title
 *   accent     "orange"|"none"  — border accent color (default "orange")
 *   size       "sm"|"md"|"lg"   — max-width (default "md")
 *   children   ReactNode        — body content
 *   footer     ReactNode?       — optional footer slot (buttons etc.)
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  accent = "orange",
  size   = "md",
  children,
  footer,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size] || "max-w-lg";
  const borderCls = accent === "orange"
    ? "border-orange-500/30"
    : "border-white/10";

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      {/* Panel — stop propagation so clicks inside don't close */}
      <div
        onClick={e => e.stopPropagation()}
        className={`w-full ${maxW} bg-[#151515] rounded-2xl border ${borderCls} shadow-2xl`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-white font-bold text-base leading-tight">{title}</h3>
            {subtitle && (
              <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-gray-600 hover:text-gray-300 transition mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pb-5 pt-1 flex gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
