import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { DEMO_GRAPH, type NodeType } from "@/lib/demo-data";
import { Banner, Btn, SectionHeader } from "./ui";

const NODE_CLS: Record<NodeType, string> = {
  objective: "fill-foreground text-background",
  measure: "fill-card stroke-foreground",
  institution: "fill-secondary stroke-muted-foreground",
  dependency: "fill-review-soft stroke-review",
  assumption: "fill-review-soft stroke-review",
  risk: "fill-risk-soft stroke-risk",
  evidence: "fill-match-soft stroke-match",
};
const W = 150, H = 44;

export function Graph({ onOpenFinding }: { onOpenFinding: (id: string) => void }) {
  const { t } = useI18n();
  const { nodes, edges } = DEMO_GRAPH;
  const [sel, setSel] = useState<string | null>(null);
  const node = nodes.find((n) => n.id === sel);
  const conn = sel ? edges.filter((e) => e.from === sel || e.to === sel) : [];
  const connIds = new Set(conn.flatMap((e) => [e.from, e.to]));
  const pos = (id: string) => nodes.find((n) => n.id === id)!;

  return (
    <section>
      <SectionHeader index="03" title={t.graph.title} intro={t.graph.intro} />
      <div className="mb-6"><Banner tone="warn">{t.graph.illustrative}</Banner></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="panel p-4 overflow-x-auto">
          <svg viewBox="0 0 760 510" className="w-full min-w-[640px]" role="group" aria-label={t.graph.title}>
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" /></marker>
            </defs>
            {edges.map((e, i) => {
              const a = pos(e.from), b = pos(e.to);
              const dim = sel && !(e.from === sel || e.to === sel);
              const dy = b.y > a.y ? -H / 2 : H / 2;
              return (
                <g key={i} opacity={dim ? 0.2 : 1}>
                  <line x1={a.x} y1={a.y + (b.y > a.y ? H / 2 : -H / 2)} x2={b.x} y2={b.y + dy} className="stroke-muted-foreground" strokeWidth={1.25} strokeDasharray={e.kind === "hypothesis" ? "5 4" : undefined} markerEnd="url(#arr)" />
                </g>
              );
            })}
            {nodes.map((n) => {
              const dim = sel && !connIds.has(n.id) && sel !== n.id;
              const isObj = n.type === "objective";
              return (
                <g key={n.id} tabIndex={0} role="button" aria-pressed={sel === n.id} aria-label={`${t.graph.types[n.type]}: ${n.label}`}
                  onClick={() => setSel(n.id)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSel(n.id))}
                  className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-primary [&:focus-visible>rect]:stroke-[3]" opacity={dim ? 0.3 : 1}>
                  <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={2} className={NODE_CLS[n.type]} strokeWidth={sel === n.id ? 2.5 : 1} />
                  <text x={n.x} y={n.y - 4} textAnchor="middle" className={`text-[9px] uppercase tracking-wider ${isObj ? "fill-background" : "fill-muted-foreground"}`}>{t.graph.types[n.type]}</text>
                  <text x={n.x} y={n.y + 11} textAnchor="middle" className={`text-[11px] font-medium ${isObj ? "fill-background" : "fill-foreground"}`}>{n.label}</text>
                  {n.missingEvidence && <circle cx={n.x + W / 2 - 6} cy={n.y - H / 2 + 6} r={4} className="fill-primary" />}
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="space-y-4">
          <div className="panel p-5">
            {node ? (
              <>
                <p className="eyebrow mb-1">{t.graph.types[node.type]}</p>
                <h2 className="font-semibold text-lg">{node.label}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{node.desc}</p>
                {node.missingEvidence && <p className="mt-3 text-xs font-medium text-primary">● {t.graph.missing}</p>}
                <p className="eyebrow mt-4 mb-2">{t.graph.connected}</p>
                <ul className="space-y-1.5 text-sm">
                  {conn.map((e, i) => {
                    const other = pos(e.from === node.id ? e.to : e.from);
                    return (
                      <li key={i}>
                        <button className="text-left hover:text-primary" onClick={() => setSel(other.id)}>{other.label}</button>
                        <span className="block text-xs text-muted-foreground">{e.label} · {e.kind === "hypothesis" ? t.graph.hypothesis : t.graph.extracted}</span>
                      </li>
                    );
                  })}
                </ul>
                {node.finding && <Btn variant="outline" className="mt-4 w-full" onClick={() => onOpenFinding(node.finding!)}>{t.graph.openFinding} ({node.finding})</Btn>}
              </>
            ) : <p className="text-sm text-muted-foreground">{t.graph.select}</p>}
          </div>
          <div className="panel p-5 text-xs space-y-2">
            <p className="eyebrow mb-2">{t.graph.legend}</p>
            <div className="flex items-center gap-2"><svg width="32" height="6"><line x1="0" y1="3" x2="32" y2="3" className="stroke-foreground" strokeWidth="1.5" /></svg>{t.graph.extracted}</div>
            <div className="flex items-center gap-2"><svg width="32" height="6"><line x1="0" y1="3" x2="32" y2="3" className="stroke-foreground" strokeWidth="1.5" strokeDasharray="5 4" /></svg>{t.graph.hypothesis}</div>
            <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-primary inline-block ml-3 mr-3" />{t.graph.missing}</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
