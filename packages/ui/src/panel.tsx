interface PanelProps {
  children?: any;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  const composedClassName = [
    "card-interactive rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 shadow-[0_0_40px_-20px_rgba(245,158,11,0.45)]",
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={composedClassName}>
      {children}
    </div>
  );
}
