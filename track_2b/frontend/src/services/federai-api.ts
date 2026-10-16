/**
 * FEDERAI API adapter — the ONLY place the UI talks to the existing FastAPI backend.
 *
 * Integration points (verify against the real backend before relying on them):
 *  - GET  {BASE}/api/health   -> health/config status (shape tolerated loosely)
 *  - POST {BASE}/api/analyze  -> body { title, text } (existing contract: title + source text)
 *
 * BASE comes from VITE_FEDERAI_API_URL (a public URL, never a secret). Empty = same origin.
 * No credentials are ever sent from the browser.
 */

export type EvidenceStatus = "exact_match" | "interpretation" | "unverified";

export interface Finding {
  id: string;
  title: string;
  type: string;
  interpretation: string;
  quote?: string | undefined;
  location?: string | undefined;
  confidence?: string | number | undefined;
  reviewAction?: string | undefined;
  limitations?: string | undefined;
  /** Status reported by backend, if any */
  backendStatus?: string | undefined;
  /** Deterministic client-side check: does quote appear verbatim in source text */
  status: EvidenceStatus;
}

export interface AnalysisResult {
  summary?: string | undefined;
  findings: Finding[];
  assumptions: string[];
  dependencies: string[];
  risks: string[];
  limitations: string[];
  /** Fields from the response not mapped above — shown, never discarded */
  unmapped: Record<string, unknown>;
  raw: unknown;
  partial: boolean;
  isDemo: boolean;
}

export interface HealthStatus {
  ok: boolean;
  raw?: unknown | undefined;
  error?: string | undefined;
}

export class ApiError extends Error {
  constructor(public kind: "timeout" | "network" | "http" | "malformed", message: string) {
    super(message);
  }
}

const BASE = (import.meta.env["VITE_FEDERAI_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";
export const apiConfigured = Boolean(import.meta.env["VITE_FEDERAI_API_URL"]);

async function request(path: string, init: RequestInit, timeoutMs: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new ApiError("http", `HTTP ${res.status}`);
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { throw new ApiError("malformed", "Response was not valid JSON"); }
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error).name === "AbortError") throw new ApiError("timeout", "Request timed out");
    throw new ApiError("network", (e as Error).message);
  } finally {
    clearTimeout(t);
  }
}

export async function getHealth(): Promise<HealthStatus> {
  try {
    const raw = await request("/api/health", { method: "GET" }, 8000);
    return { ok: true, raw };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function analyzePolicy(title: string, text: string): Promise<AnalysisResult> {
  const raw = await request(
    "/api/analyze",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, source: text }) },
    180000,
  );
  return normalize(raw, text, false);
}

/* ---------- normalization ---------- */

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? undefined : typeof v === "number" ? String(v) : undefined);
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : str((x as any)?.text ?? (x as any)?.description ?? (x as any)?.name) ?? JSON.stringify(x))) : [];

const squash = (s: string) => s.replace(/\s+/g, " ").replace(/[“”„«»]/g, '"').replace(/[‘’]/g, "'").trim().toLowerCase();

export function quoteMatches(quote: string | undefined, source: string): boolean {
  if (!quote || quote.trim().length < 4) return false;
  return squash(source).includes(squash(quote));
}

const FINDING_KEYS = ["findings", "claims", "results", "items", "analysis"];
const KNOWN = new Set([...FINDING_KEYS, "summary", "executive_summary", "assumptions", "dependencies", "risks", "limitations"]);

export function normalize(raw: unknown, source: string, isDemo: boolean): AnalysisResult {
  if (!raw || typeof raw !== "object") throw new ApiError("malformed", "Unexpected response shape");
  const r = raw as any;
  const listKey = FINDING_KEYS.find((k) => Array.isArray(r[k]));
  const list = (listKey ? r[listKey] : []) as unknown[];

  const findings: Finding[] = list.map((item, i) => {
    const f: any = typeof item === "object" && item ? item : { text: item };
    const quote = str(f.quote ?? f.evidence_quote ?? f.source_quote ?? f.evidence ?? f.citation);    
    const matched = quoteMatches(quote, source);
    const interp = str(f.interpretation ?? f.finding ?? f.claim ?? f.text ?? f.description) ?? "";
    return {
      id: str(f.id) ?? `F${i + 1}`,
      title: str(f.title ?? f.name) ?? interp.slice(0, 80),
      type: str(f.type ?? f.category) ?? "finding",
      interpretation: interp,
      quote,
      location: str(f.location ?? f.source_locator ?? f.reference ?? f.section),      
      confidence: (f.confidence as any) ?? undefined,
      reviewAction: str(f.review_action ?? f.review_note ?? f.reviewAction ?? f.action),            limitations: str(f.limitations ?? f.limitation),
      backendStatus: str(f.status ?? f.evidence_status),
      status: matched ? "exact_match" : quote ? "unverified" : "interpretation",
    };
  });

  const unmapped: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) if (!KNOWN.has(k)) unmapped[k] = v;

  const summary = str(r.summary ?? r.executive_summary);
  return {
    summary,
    findings,
    assumptions: strList(r.assumptions),
    dependencies: strList(r.dependencies),
    risks: strList(r.risks),
    limitations: strList(r.limitations),
    unmapped,
    raw,
    partial: !summary || findings.length === 0,
    isDemo,
  };
}
