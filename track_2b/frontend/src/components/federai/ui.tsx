import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, Info, UserCheck } from "lucide-react";
import type { EvidenceStatus } from "@/services/federai-api";
import { useI18n } from "@/i18n/context";

const STATUS_STYLE: Record<EvidenceStatus, string> = {
  exact_match: "bg-match-soft text-match border-match/30",
  interpretation: "bg-review-soft text-review border-review/30",
  unverified: "bg-risk-soft text-risk border-risk/30",
};
const STATUS_ICON = { exact_match: CheckCircle2, interpretation: CircleHelp, unverified: AlertTriangle };

export function StatusBadge({ status }: { status: EvidenceStatus }) {
  const { t } = useI18n();
  const Icon = STATUS_ICON[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium rounded-sm ${STATUS_STYLE[status]}`} title={t.ev[`${status}Desc`]}>
      <Icon className="size-3.5" aria-hidden /> {t.ev[status]}
    </span>
  );
}

export function ReviewBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1.5 border border-foreground/20 px-2 py-0.5 text-xs font-medium rounded-sm text-foreground">
      <UserCheck className="size-3.5" aria-hidden /> {t.ev.humanReview}
    </span>
  );
}

export function Banner({ tone = "info", children, action }: { tone?: "info" | "warn" | "error"; children: ReactNode; action?: ReactNode }) {
  const cls = tone === "error" ? "border-risk/40 bg-risk-soft text-risk" : tone === "warn" ? "border-review/40 bg-review-soft text-review" : "border-border bg-card text-muted-foreground";
  const Icon = tone === "info" ? Info : AlertTriangle;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex items-start gap-3 border px-4 py-3 text-sm rounded-sm ${cls}`}>
      <Icon className="size-4 mt-0.5 shrink-0" aria-hidden />
      <div className="flex-1">{children}</div>
      {action}
    </div>
  );
}

export function SectionHeader({ index, title, intro, right }: { index: string; title: string; intro?: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-4 mb-6">
      <div className="max-w-2xl">
        <p className="eyebrow mb-2"><span className="text-primary">{index}</span> — FEDERAI</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {intro && <p className="mt-2 text-muted-foreground">{intro}</p>}
      </div>
      {right}
    </header>
  );
}

export function Btn({ variant = "primary", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const v =
    variant === "primary" ? "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
    : variant === "outline" ? "border border-foreground/80 text-foreground hover:bg-foreground hover:text-background"
    : "text-muted-foreground hover:text-foreground";
  return <button {...p} className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-sm transition-colors ${v} ${className}`} />;
}

export function EmptyState({ onGo }: { onGo: () => void }) {
  const { t } = useI18n();
  return (
    <div className="panel p-12 text-center">
      <h2 className="text-lg font-semibold">{t.state.empty}</h2>
      <p className="mt-2 text-muted-foreground">{t.state.emptyBody}</p>
      <Btn variant="outline" className="mt-6" onClick={onGo}>{t.state.goWorkspace}</Btn>
    </div>
  );
}
