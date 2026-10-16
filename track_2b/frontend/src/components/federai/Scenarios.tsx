import { useState } from "react";
import { useI18n } from "@/i18n/context";
import type { AnalysisResult } from "@/services/federai-api";
import { SectionHeader } from "./ui";

export const SCENARIOS = ["budget", "delay", "capacity"] as const;

export function Scenarios({ result }: { result: AnalysisResult }) {
  const { t } = useI18n();
  const [k, setK] = useState<(typeof SCENARIOS)[number]>("budget");
  const s = t.sc[k];
  const affected = [...result.dependencies, ...result.assumptions];

  return (
    <section>
      <SectionHeader index="04" title={t.sc.title} intro={t.sc.intro} />
      <div role="tablist" className="flex flex-wrap border-b border-border mb-6">
        {SCENARIOS.map((x) => (
          <button key={x} role="tab" aria-selected={k === x} onClick={() => setK(x)}
            className={`px-4 py-3 text-sm font-medium -mb-px border-b-2 ${k === x ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.sc[x].name}
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          <h2 className="text-xl font-semibold">{s.name}</h2>
          <span className="border border-review/40 bg-review-soft text-review px-2.5 py-1 text-xs font-semibold uppercase tracking-wider rounded-sm">{t.sc.badge}</span>
        </div>
        <div className="grid md:grid-cols-2">
          <Block title={t.sc.assumptions}><p>{s.assumptions}</p></Block>
          <Block title={t.sc.affected}>{affected.length ? <ul className="space-y-1">{affected.map((a) => <li key={a}>— {a}</li>)}</ul> : <p className="text-muted-foreground">{t.sc.noDeps}</p>}</Block>
          <Block title={t.sc.pathways}><ul className="space-y-1">{s.pathways.map((a) => <li key={a}>— {a}</li>)}</ul></Block>
          <Block title={t.sc.gaps}><ul className="space-y-1">{s.gaps.map((a) => <li key={a}>— {a}</li>)}</ul></Block>
          <Block title={t.sc.actions} wide><ul className="space-y-1">{s.actions.map((a) => <li key={a}>☐ {a}</li>)}</ul></Block>
        </div>
        <p className="border-t border-border px-6 py-3 text-xs text-muted-foreground">{t.sc.method}</p>
      </div>
    </section>
  );
}

function Block({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <div className={`p-6 text-sm border-b border-border md:odd:border-r ${wide ? "md:col-span-2 md:border-r-0" : ""}`}><p className="eyebrow mb-3">{title}</p>{children}</div>;
}
