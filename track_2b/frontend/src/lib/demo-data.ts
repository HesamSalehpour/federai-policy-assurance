// ILLUSTRATIVE DEMO CONTENT — fictional, for visual development only. Never presented as a real analysis.
import { normalize, type AnalysisResult } from "@/services/federai-api";

export const DEMO_DOC = {
  title: "Illustrative excerpt: Cantonal Heat Resilience Programme 2027–2030",
  institution: "Fictional example — no issuing authority",
  date: "",
  language: "en",
  text: `Article 1 — Objective
The programme aims to reduce heat-related health risks for residents over 75 years of age by 2030.

Article 2 — Measures
Municipalities shall establish cooling centres in public buildings during declared heat alerts. The cantonal health office shall coordinate outreach with home-care providers.

Article 3 — Financing
Implementation is financed through the existing prevention budget, subject to annual parliamentary approval.

Article 4 — Evaluation
An evaluation report shall be submitted to the cantonal parliament by the end of 2029.`,
};

export function demoResult(): AnalysisResult {
  return normalize(
    {
      summary:
        "The excerpt defines one health objective, two operational measures delegated to municipalities and the cantonal health office, a financing mechanism dependent on annual approval, and an evaluation milestone. No quantitative targets or baseline are stated.",
      findings: [
        { id: "F1", title: "Objective lacks a measurable baseline", type: "objective", interpretation: "The objective is time-bound but does not define a baseline or indicator for 'heat-related health risks'.", quote: "reduce heat-related health risks for residents over 75 years of age by 2030", location: "Art. 1", review_action: "Confirm whether indicators are defined in a separate ordinance." },
        { id: "F2", title: "Municipal capacity is assumed", type: "assumption", interpretation: "The measure assumes municipalities have suitable public buildings and staff available during heat alerts.", quote: "Municipalities shall establish cooling centres in public buildings during declared heat alerts.", location: "Art. 2", review_action: "Check municipal capacity data; consult the association of municipalities." },
        { id: "F3", title: "Financing depends on annual approval", type: "dependency", interpretation: "Continuity of measures across the four-year period depends on yearly budget decisions.", quote: "subject to annual parliamentary approval", location: "Art. 3", review_action: "Assess the consequences of a reduced or delayed appropriation." },
        { id: "F4", title: "Coordination mechanism not specified", type: "risk", interpretation: "How outreach with home-care providers is coordinated (data sharing, responsibilities) is not described.", quote: "shall coordinate outreach with all private and public home-care providers", location: "Art. 2", review_action: "The quoted wording differs from the source; verify the actual provision." },
        { id: "F5", title: "Evaluation precedes programme end", type: "interpretation", interpretation: "The evaluation deadline (2029) precedes the objective deadline (2030), so the final outcome may not be assessable in the report.", location: "Art. 1, Art. 4", review_action: "Clarify whether an interim or final evaluation is intended." },
      ],
      assumptions: ["Municipalities have suitable buildings and staff.", "Home-care providers are willing to participate in outreach."],
      dependencies: ["Annual parliamentary budget approval.", "Declared heat alerts as trigger for cooling centres."],
      risks: ["Uneven implementation across municipalities.", "Interruption of measures following a budget reduction."],
      limitations: ["Analysis restricted to the supplied excerpt.", "No external sources were consulted."],
    },
    DEMO_DOC.text,
    true,
  );
}

export type NodeType = "objective" | "measure" | "institution" | "dependency" | "assumption" | "risk" | "evidence";
export interface GNode { id: string; label: string; type: NodeType; x: number; y: number; desc: string; finding?: string; missingEvidence?: boolean }
export interface GEdge { from: string; to: string; kind: "extracted" | "hypothesis"; label: string }

export const DEMO_GRAPH: { nodes: GNode[]; edges: GEdge[] } = {
  nodes: [
    { id: "o1", label: "Reduce heat risks (75+)", type: "objective", x: 380, y: 60, desc: "Programme objective stated in Art. 1.", finding: "F1" },
    { id: "m1", label: "Cooling centres", type: "measure", x: 170, y: 190, desc: "Municipal measure during heat alerts (Art. 2).", finding: "F2" },
    { id: "m2", label: "Home-care outreach", type: "measure", x: 590, y: 190, desc: "Coordinated by cantonal health office (Art. 2).", finding: "F4", missingEvidence: true },
    { id: "i1", label: "Municipalities", type: "institution", x: 80, y: 330, desc: "Responsible for cooling centres." },
    { id: "i2", label: "Cantonal health office", type: "institution", x: 680, y: 330, desc: "Responsible for outreach coordination." },
    { id: "a1", label: "Municipal capacity", type: "assumption", x: 270, y: 330, desc: "Assumed, not evidenced in the text.", finding: "F2", missingEvidence: true },
    { id: "d1", label: "Annual budget approval", type: "dependency", x: 450, y: 330, desc: "Financing condition (Art. 3).", finding: "F3" },
    { id: "r1", label: "Funding interruption", type: "risk", x: 450, y: 460, desc: "Hypothetical failure pathway.", finding: "F3" },
    { id: "e1", label: "Art. 3 text", type: "evidence", x: 620, y: 460, desc: "Source excerpt for financing." },
  ],
  edges: [
    { from: "m1", to: "o1", kind: "extracted", label: "contributes to" },
    { from: "m2", to: "o1", kind: "extracted", label: "contributes to" },
    { from: "i1", to: "m1", kind: "extracted", label: "implements" },
    { from: "i2", to: "m2", kind: "extracted", label: "implements" },
    { from: "a1", to: "m1", kind: "hypothesis", label: "assumed by" },
    { from: "d1", to: "m1", kind: "extracted", label: "finances" },
    { from: "d1", to: "m2", kind: "extracted", label: "finances" },
    { from: "r1", to: "d1", kind: "hypothesis", label: "threatens" },
    { from: "e1", to: "d1", kind: "extracted", label: "supports" },
  ],
};
