import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { AnalysisResult, EvidenceStatus } from "@/services/federai-api";
import { ReviewBadge, SectionHeader, StatusBadge } from "./ui";

export function Evidence({ result, docLang, focusId }: { result: AnalysisResult; docLang: string; focusId: string | null }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<EvidenceStatus | "all">("all");
  const [type, setType] = useState("all");
  const types = useMemo(() => [...new Set(result.findings.map((f) => f.type))], [result]);
  const list = result.findings.filter((f) => (status === "all" || f.status === status) && (type === "all" || f.type === type));
  const sel = "bg-card border border-input rounded-sm px-3 py-2 text-sm";

  return (
    <section>
      <SectionHeader index="02" title={t.ev.title} intro={t.ev.intro} />
      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        {(["exact_match", "interpretation", "unverified"] as const).map((s) => (
          <div key={s} className="panel p-4">
            <div className="flex items-center justify-between"><StatusBadge status={s} /><span className="font-mono text-sm">{result.findings.filter((f) => f.status === s).length}</span></div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{t.ev[`${s}Desc`]}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <label className="sr-only" htmlFor="fs">{t.ev.status}</label>
        <select id="fs" className={sel} value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="all">{t.ev.allStatus}</option>
          {(["exact_match", "interpretation", "unverified"] as const).map((s) => <option key={s} value={s}>{t.ev[s]}</option>)}
        </select>
        <label className="sr-only" htmlFor="ft">{t.ev.type}</label>
        <select id="ft" className={sel} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">{t.ev.allTypes}</option>
          {types.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </div>
      {list.length === 0 ? <p className="panel p-8 text-center text-muted-foreground">{t.ev.none}</p> : (
        <ol className="space-y-3">
          {list.map((f) => (
            <li key={f.id} id={`finding-${f.id}`}>
              <details open={focusId === f.id || undefined} className={`panel group ${focusId === f.id ? "ring-2 ring-primary" : ""}`}>
                <summary className="flex cursor-pointer list-none items-start gap-4 p-5">
                  <span className="font-mono text-xs text-muted-foreground pt-1 w-8">{f.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={f.status} /><ReviewBadge />
                      <span className="eyebrow">{f.type}</span>
                    </div>
                    <h3 className="font-semibold">{f.title}</h3>
                    {f.location && <p className="text-xs text-muted-foreground mt-1">{t.ev.location}: {f.location}</p>}
                  </div>
                  <ChevronDown className="size-4 mt-1 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="grid gap-5 border-t border-border p-5 md:grid-cols-2">
                  <div>
                    <p className="eyebrow mb-2">{t.ev.quote}</p>
                    {f.quote ? (
                      <blockquote lang={docLang} className="border-l-2 border-foreground bg-quote px-4 py-3 font-mono text-sm leading-relaxed">“{f.quote}”<span className="block mt-2 eyebrow">{docLang.toUpperCase()}</span></blockquote>
                    ) : <p className="text-sm text-muted-foreground italic">{t.ev.noQuote}</p>}
                  </div>
                  <div className="space-y-4 text-sm">
                    <div><p className="eyebrow mb-1">{t.ev.interpretationLbl}</p><p>{f.interpretation}</p></div>
                    {f.reviewAction && <div><p className="eyebrow mb-1">{t.ev.reviewAction}</p><p>{f.reviewAction}</p></div>}
                    {f.limitations && <div><p className="eyebrow mb-1">{t.ev.limitations}</p><p>{f.limitations}</p></div>}
                    {f.confidence != null && <div><p className="eyebrow mb-1">{t.ev.confidence}</p><p className="font-mono">{String(f.confidence)}</p></div>}
                    {f.backendStatus && <div><p className="eyebrow mb-1">{t.ev.backendStatus}</p><p className="font-mono">{f.backendStatus}</p></div>}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
      {!result.isDemo && (
        <details className="panel mt-6 p-5 text-sm">
          <summary className="cursor-pointer font-medium">{Object.keys(result.unmapped).length ? t.ev.unmapped : t.ev.raw}</summary>
          <pre className="mt-3 overflow-auto max-h-96 bg-quote p-3 font-mono text-xs whitespace-pre-wrap">{JSON.stringify(result.raw, null, 2)}</pre>
        </details>
      )}
    </section>
  );
}
