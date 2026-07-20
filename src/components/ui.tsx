import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { avatarColor, initials } from "../lib/format";
import { classifyScore, scoreColors } from "../lib/scoring";
import { useApp } from "../store/AppStore";

export function Avatar({
  name,
  size = 40,
  className = ""
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: avatarColor(name),
        fontSize: size * 0.38
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

export function ScoreDot({
  strokes,
  par,
  size = 8
}: {
  strokes: number | null;
  par: number;
  size?: number;
}) {
  const cls = classifyScore(strokes, par);
  if (cls === "none") return null;
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: scoreColors[cls] }}
    />
  );
}

/** Scorecard cell: number tinted by score class. */
export function ScoreCell({
  strokes,
  par
}: {
  strokes: number | null;
  par: number;
}) {
  const cls = classifyScore(strokes, par);
  const color = cls === "none" ? "var(--c-sub)" : scoreColors[cls];
  const bg =
    cls === "none" || cls === "par" ? "transparent" : `${scoreColors[cls]}1f`;
  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-[9px] text-[13px] font-semibold tabular-nums"
      style={{ color, background: bg }}
    >
      {strokes ?? "–"}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = ""
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-[10px] bg-card2 p-[2px] ${className}`}
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[8px] px-3 py-[6px] text-[13px] font-semibold transition-all duration-200 ${
            value === o.value
              ? "bg-card text-ink shadow-sm dark:bg-[#636366]/60"
              : "text-sub"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** iOS-style large title that condenses into the nav bar on scroll. */
export function LargeTitle({
  title,
  back,
  right,
  children
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const [condensed, setCondensed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 34);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div
        className={`sticky top-0 z-30 flex h-[52px] items-center justify-between px-4 backdrop-blur-xl transition-colors duration-200 ${
          condensed ? "bg-app/80 hairline-b" : "bg-transparent"
        }`}
      >
        <div className="flex w-20 items-center">
          {back && (
            <button
              onClick={() => navigate(-1)}
              className="press -ml-2 flex items-center gap-0.5 py-1 pr-2 text-[17px] font-normal text-accent"
              aria-label="Back"
            >
              <ChevronLeft size={26} strokeWidth={2.2} className="-mr-0.5" />
              Back
            </button>
          )}
        </div>
        <span
          className={`text-[17px] font-semibold transition-opacity duration-200 ${
            condensed ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </span>
        <div className="flex w-20 items-center justify-end">{right}</div>
      </div>
      <div className="px-4 pb-2">
        <h1 className="text-[34px] font-bold leading-[41px] tracking-[0.37px]">
          {title}
        </h1>
        {children}
      </div>
    </>
  );
}

export function Card({
  children,
  className = "",
  onClick
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`block w-full rounded-card bg-card text-left ${
        onClick ? "press" : ""
      } ${className}`}
    >
      {children}
    </Comp>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-4 pb-2 pt-6 text-[13px] font-semibold uppercase tracking-wide text-sub">
      {children}
    </p>
  );
}

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating) ? "text-accent" : "text-sub opacity-40"
          }
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card2 text-sub">
        {icon}
      </div>
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-1 max-w-[260px] text-[14px] leading-snug text-sub">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-6">
      <div className="anim-pop rounded-full bg-card2 px-5 py-2.5 text-[14px] font-semibold shadow-lg">
        {toast}
      </div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="anim-fade absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className="anim-sheet safe-b relative z-10 max-h-[85vh] w-full max-w-[600px] overflow-y-auto rounded-t-[20px] bg-card pb-6">
        <div className="sticky top-0 z-10 bg-card pb-1 pt-2">
          <div className="mx-auto h-[5px] w-9 rounded-full bg-sub/30" />
          {title && (
            <p className="px-5 pb-2 pt-3 text-[20px] font-bold">{title}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
