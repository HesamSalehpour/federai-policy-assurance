import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/context";
import { Banner, Btn, SectionHeader } from "./ui";
import type { ApiError } from "@/services/federai-api";

export interface DocMeta { title: string; institution: string; date: string; language: string; text: string; illustrative: boolean }

const DOC_LANGS = ["de", "fr", "it", "rm", "en"] as const;
const LANG_NAMES: Record<string, string> = { de: "Deutsch", fr: "Français", it: "Italiano", rm: "Rumantsch", en: "English" };

const field = "w-full bg-card border border-input rounded-sm px-3 py-2 text-sm focus:border-foreground outline-none";

export function Workspace({ doc, setDoc, onAnalyse, onExample, loading, error, apiConfigured }: {
  doc: DocMeta; setDoc: (d: DocMeta) => void; onAnalyse: () => void; onExample: () => void;
  loading: boolean; error: ApiError | null; apiConfigured: boolean;
}) {
  const { t } = useI18n();
  const [touched, setTouched] = useState(false);
  const titleErr = touched && !doc.title.trim();
  const textErr = touched && doc.text.trim().length < 50;
  const upd = (k: keyof DocMeta) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setDoc({ ...doc, [k]: e.target.value, illustrative: k === "text" ? false : doc.illustrative });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!doc.title.trim() || doc.text.trim().length < 50) return;
    onAnalyse();
  };

  return (
    <section>
      <SectionHeader index="01" title={t.ws.title} intro={t.ws.intro} right={<Btn variant="outline" type="button" onClick={onExample}>{t.ws.loadExample}</Btn>} />
      {!apiConfigured && <div className="mb-6"><Banner tone="warn">{t.state.notConfigured}</Banner></div>}
      {error && (
        <div className="mb-6">
          <Banner tone="error" action={<Btn variant="outline" onClick={onAnalyse}>{t.state.retry}</Btn>}>
            <strong>{t.state[error.kind]}</strong> <span className="opacity-80">({error.message})</span>
          </Banner>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <form onSubmit={submit} className="panel p-6 space-y-5" noValidate>
          {doc.illustrative && <p className="eyebrow text-review">{t.ws.illustrative}</p>}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="title">{t.ws.docTitle} *</label>
            <input id="title" className={field} value={doc.title} onChange={upd("title")} aria-invalid={titleErr} aria-describedby={titleErr ? "title-err" : undefined} />
            {titleErr && <p id="title-err" className="mt-1 text-xs text-risk">{t.ws.errTitle}</p>}
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium mb-1.5" htmlFor="inst">{t.ws.institution}</label>
              <input id="inst" className={field} value={doc.institution} onChange={upd("institution")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="date">{t.ws.date}</label>
              <input id="date" type="date" className={field} value={doc.date} onChange={upd("date")} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="dlang">{t.ws.docLang}</label>
              <select id="dlang" className={field} value={doc.language} onChange={upd("language")}>
                {DOC_LANGS.map((l) => <option key={l} value={l}>{LANG_NAMES[l]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="text-sm font-medium" htmlFor="src">{t.ws.source} *</label>
              <span className="text-xs text-muted-foreground font-mono">{doc.text.length} {t.ws.chars}</span>
            </div>
            <textarea id="src" lang={doc.language} rows={14} className={`${field} font-mono leading-relaxed resize-y`} value={doc.text} onChange={upd("text")} aria-invalid={textErr} />
            {textErr && <p className="mt-1 text-xs text-risk">{t.ws.errText}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="rlang">{t.ws.reportLang}</label>
            <select id="rlang" className={`${field} max-w-xs`} disabled><option>— {t.rp.notProvided}</option></select>
            <p className="mt-1 text-xs text-muted-foreground">{t.ws.reportLangNote}</p>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <Btn type="submit" disabled={loading || !apiConfigured} className="mt-4">
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loading ? t.ws.analysing : t.ws.analyse}
            </Btn>
            <Btn type="button" variant="ghost" className="mt-4" onClick={() => setDoc({ title: "", institution: "", date: "", language: "de", text: "", illustrative: false })}>{t.ws.clear}</Btn>
          </div>
        </form>
        <aside className="space-y-6 text-sm">
          <div className="border-l-2 border-match pl-4">
            <h2 className="font-semibold mb-2">{t.ws.canTitle}</h2>
            <ul className="space-y-1.5 text-muted-foreground">{t.ws.can.map((c) => <li key={c}>— {c}</li>)}</ul>
          </div>
          <div className="border-l-2 border-primary pl-4">
            <h2 className="font-semibold mb-2">{t.ws.cannotTitle}</h2>
            <ul className="space-y-1.5 text-muted-foreground">{t.ws.cannot.map((c) => <li key={c}>— {c}</li>)}</ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
