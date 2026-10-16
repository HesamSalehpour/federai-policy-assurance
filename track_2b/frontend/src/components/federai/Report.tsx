import { Printer } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { AnalysisResult } from "@/services/federai-api";
import type { DocMeta } from "./Workspace";
import { Banner, Btn, SectionHeader, StatusBadge } from "./ui";

export function Report({ result, doc }: { result: AnalysisResult; doc: DocMeta }) {
  const { t } = useI18n();
  const np = t.rp.notProvided;
  return (
    <section>
      <div className="no-print"><SectionHeader index="05" title={t.rp.title} right={<Btn onClick={() => window.print()}><Printer className="size-4" aria-hidden />{t.rp.print}</Btn>} /></div>
      <article className="print-area panel mx-auto max-w-3xl p-10 text-sm leading-relaxed">
        <header className="flex items-start justify-between border-b-2 border-foreground pb-4 mb-8">
          <div><p className="eyebrow">FEDERAI · {t.rp.title}</p><h1 className="mt-1 text-2xl font-semibold">{doc.title || np}</h1></div>
          <span className="swiss-cross size-8 shrink-0" aria-hidden />
        </header>
        {result.isDemo && <div className="mb-6"><Banner tone="warn">{t.state.demoBanner}</Banner></div>}

        <S n="1" title={t.rp.s1}>
          <dl className="grid grid-cols-[180px_1fr] gap-y-1">
            <dt className="text-muted-foreground">{t.ws.institution}</dt><dd>{doc.institution || np}</dd>
            <dt className="text-muted-foreground">{t.ws.date}</dt><dd>{doc.date || np}</dd>
            <dt className="text-muted-foreground">{t.ws.docLang}</dt><dd>{doc.language.toUpperCase()}</dd>
            <dt className="text-muted-foreground">{t.rp.model}</dt><dd>Apertus</dd>
            <dt className="text-muted-foreground">{t.rp.generated}</dt><dd suppressHydrationWarning>{new Date().toISOString().slice(0, 16).replace("T", " ")} UTC</dd>
          </dl>
        </S>
        <S n="2" title={t.rp.s2}><Tag>{t.rp.modelLbl}</Tag><p>{result.summary || np}</p></S>
        <S n="3" title={t.rp.s3}>
          <Tag>{t.rp.modelLbl}</Tag>
          <ol className="space-y-2">{result.findings.map((f) => <li key={f.id}><span className="font-mono text-xs text-muted-foreground mr-2">{f.id}</span><strong>{f.title}</strong> — {f.interpretation}</li>)}</ol>
        </S>
        <S n="4" title={t.rp.s4}>
          <Tag>{t.rp.sourceLbl} · {t.rp.detLbl}</Tag>
          <ul className="space-y-3">{result.findings.filter((f) => f.quote).map((f) => (
            <li key={f.id} className="break-inside-avoid">
              <div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs">{f.id}</span><StatusBadge status={f.status} />{f.location && <span className="text-xs text-muted-foreground">{f.location}</span>}</div>
              <blockquote lang={doc.language} className="border-l-2 border-foreground pl-3 font-mono text-xs">“{f.quote}”</blockquote>
            </li>
          ))}</ul>
        </S>
        <S n="5" title={t.rp.s5}>
          <Tag>{t.rp.modelLbl}</Tag>
          <List title={t.rp.dependencies} items={result.dependencies} np={np} />
          <List title={t.rp.assumptions} items={result.assumptions} np={np} />
          <List title={t.rp.risks} items={result.risks} np={np} />
        </S>
        <S n="6" title={t.rp.s6}><Tag>{t.sc.badge}</Tag><p>{t.rp.s6body}</p></S>
        <S n="7" title={t.rp.s7}><List items={result.limitations} np={np} /></S>
        <S n="8" title={t.rp.s8}>
          <Tag>{t.rp.openLbl}</Tag>
          <ul className="space-y-1">{result.findings.filter((f) => f.reviewAction).map((f) => <li key={f.id}>☐ <span className="font-mono text-xs">{f.id}</span> {f.reviewAction}</li>)}</ul>
        </S>
        <S n="9" title={t.rp.s9}><p>{t.rp.s9body}</p></S>
        <footer className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">{t.rp.disclaimer}</footer>
      </article>
    </section>
  );
}

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return <section className="mb-7 break-inside-avoid"><h2 className="mb-2 flex gap-3 text-base font-semibold"><span className="text-primary font-mono">{n}</span>{title}</h2>{children}</section>;
}
function Tag({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-2">[{children}]</p>;
}
function List({ title, items, np }: { title?: string; items: string[]; np: string }) {
  return <div className="mb-2">{title && <p className="font-medium">{title}</p>}{items.length ? <ul className="list-disc pl-5">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="text-muted-foreground">{np}</p>}</div>;
}
