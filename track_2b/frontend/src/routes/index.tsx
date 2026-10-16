import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { I18nProvider, useI18n } from "@/i18n/context";
import { LANGS, type Lang } from "@/i18n/dictionaries";
import { analyzePolicy, apiConfigured, ApiError, getHealth, type AnalysisResult, type HealthStatus } from "@/services/federai-api";
import { DEMO_DOC, demoResult } from "@/lib/demo-data";
import { Workspace, type DocMeta } from "@/components/federai/Workspace";
import { Evidence } from "@/components/federai/Evidence";
import { Graph } from "@/components/federai/Graph";
import { Scenarios } from "@/components/federai/Scenarios";
import { Report } from "@/components/federai/Report";
import { Banner, EmptyState } from "@/components/federai/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FEDERAI — Swiss Policy Assurance Platform" },
      { name: "description", content: "Evidence-centred policy assurance workspace for Swiss public institutions, powered by Apertus." },
      { property: "og:title", content: "FEDERAI — Swiss Policy Assurance Platform" },
      { property: "og:description", content: "Trace policy findings to source evidence, test hypothetical risks and prepare assurance reports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <I18nProvider><App /></I18nProvider>,
});

type View = "workspace" | "evidence" | "graph" | "scenarios" | "report";
const VIEWS: View[] = ["workspace", "evidence", "graph", "scenarios", "report"];

function App() {
  const { t, lang, setLang } = useI18n();
  const [view, setView] = useState<View>("workspace");
  const [doc, setDoc] = useState<DocMeta>({ title: "", institution: "", date: "", language: "de", text: "", illustrative: false });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => { if (apiConfigured) getHealth().then(setHealth); }, []);

  const go = (v: View) => { setView(v); window.scrollTo({ top: 0 }); };

  const analyse = async () => {
    setLoading(true); setError(null);
    try {
      const r = await analyzePolicy(doc.title, doc.text);
      setResult(r); go("evidence");
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError("network", String(e)));
    } finally { setLoading(false); }
  };

  const loadExample = () => {
    setDoc({ ...DEMO_DOC, illustrative: true });
    setResult(demoResult()); setError(null);
  };

  const backendLabel = !apiConfigured ? t.backendUnset : health == null ? "…" : health.ok ? t.backendOk : t.backendDown;
  const backendDot = !apiConfigured ? "bg-muted-foreground" : health?.ok ? "bg-match" : "bg-risk";

  return (
    <div className="min-h-screen">
      <header className="no-print bg-card border-b border-border">
        <div className="mx-auto max-w-7xl px-6 flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
          <div className="flex items-center gap-3">
            <span className="swiss-cross size-7" aria-hidden />
            <div className="leading-tight">
              <p className="font-bold tracking-[0.18em] text-lg">FEDERAI</p>
              <p className="text-[11px] text-muted-foreground">{t.descriptor}</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground"><span className={`size-2 rounded-full ${backendDot}`} aria-hidden />{t.backend}: {backendLabel}</span>
            <span title={t.sovereigntyTip} className="inline-flex items-center gap-1.5 border border-review/40 bg-review-soft text-review px-2 py-1 font-medium rounded-sm">
              <ShieldAlert className="size-3.5" aria-hidden />{t.sovereignty}
            </span>
            <div role="radiogroup" aria-label={t.language} className="flex border border-border rounded-sm">
              {LANGS.map((l) => (
                <button key={l.code} role="radio" aria-checked={lang === l.code} lang={l.code} title={l.label} onClick={() => setLang(l.code as Lang)}
                  className={`px-2 py-1 font-mono uppercase ${lang === l.code ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                  {l.code}
                </button>
              ))}
            </div>
          </div>
        </div>
        <nav aria-label="Workspace" className="mx-auto max-w-7xl px-6 flex overflow-x-auto">
          {VIEWS.map((v, i) => (
            <button key={v} onClick={() => go(v)} aria-current={view === v ? "page" : undefined}
              className={`whitespace-nowrap px-4 py-3 text-sm -mb-px border-b-2 ${view === v ? "border-primary font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <span className="font-mono text-xs mr-2 opacity-60">0{i + 1}</span>{t.nav[v]}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {lang === "rm" && <div className="mb-6 no-print"><Banner tone="warn">{t.rmNotice}</Banner></div>}
        {result?.isDemo && view !== "workspace" && view !== "report" && <div className="mb-6"><Banner tone="warn">{t.state.demoBanner}</Banner></div>}
        {result?.partial && !result.isDemo && view !== "workspace" && <div className="mb-6"><Banner tone="warn">{t.state.partial}</Banner></div>}

        {view === "workspace" && <Workspace doc={doc} setDoc={setDoc} onAnalyse={analyse} onExample={loadExample} loading={loading} error={error} apiConfigured={apiConfigured} />}
        {view === "graph" && <Graph onOpenFinding={(id) => { setFocus(id); if (!result) loadExample(); go("evidence"); }} />}
        {view !== "workspace" && view !== "graph" && (!result ? <EmptyState onGo={() => go("workspace")} /> : (
          <>
            {view === "evidence" && <Evidence result={result} docLang={doc.language} focusId={focus} />}
            {view === "scenarios" && <Scenarios result={result} />}
            {view === "report" && <Report result={result} doc={doc} />}
          </>
        ))}
      </main>
    </div>
  );
}
