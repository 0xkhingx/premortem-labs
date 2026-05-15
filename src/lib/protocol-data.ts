export type Severity = "low" | "medium" | "high" | "critical";

export type RiskAnnotation = {
  line: number;
  text: string;
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
};

export type ProtocolLine = {
  n: number;
  text: string;
  kind?: "heading" | "subheading" | "comment" | "code";
};

// Realistic STZ/Nicotinamide diabetes induction protocol
export const PROTOCOL_LINES: ProtocolLine[] = [
  { n: 1, text: "## 1. Animal Model & Ethics", kind: "heading" },
  { n: 2, text: "Species: Rattus norvegicus (Wistar strain)", kind: "code" },
  { n: 3, text: "Sex: Male; Age: 8–10 weeks; Weight: 180–220 g", kind: "code" },
  { n: 4, text: "Source: University of Ibadan Central Animal House", kind: "code" },
  { n: 5, text: "Ethics: Approved by UI/UCH Animal Ethics Committee (UI-ACUREC/24/0117)", kind: "code" },
  { n: 6, text: "Reporting compliance: ARRIVE 2.0 Essential 10", kind: "code" },
  { n: 7, text: "", kind: "code" },
  { n: 8, text: "## 2. Housing & Acclimatization", kind: "heading" },
  { n: 9, text: "Housing: 3 rats per polypropylene cage, 12h/12h light cycle", kind: "code" },
  { n: 10, text: "Temperature: 22 ± 2°C; Relative humidity: 50–60%", kind: "code" },
  { n: 11, text: "Acclimatization: 7 days prior to intervention with ad libitum access", kind: "code" },
  { n: 12, text: "Diet: Standard rodent chow (Vital Feeds, Nigeria); water ad libitum", kind: "code" },
  { n: 13, text: "", kind: "code" },
  { n: 14, text: "## 3. Pre-Induction Fasting", kind: "heading" },
  { n: 15, text: "Fast all animals overnight prior to induction.", kind: "code" },
  { n: 16, text: "Withdraw food at 18:00; allow free access to water.", kind: "code" },
  { n: 17, text: "Note: Fasting duration may vary 10–14 h between cohorts.", kind: "comment" },
  { n: 18, text: "", kind: "code" },
  { n: 19, text: "## 4. STZ + Nicotinamide Preparation", kind: "heading" },
  { n: 20, text: "Streptozotocin (Sigma-Aldrich, S0130) — dissolve in 0.1 M citrate buffer, pH 4.5.", kind: "code" },
  { n: 21, text: "Prepare STZ solution fresh; keep on ice and use within 15 minutes.", kind: "code" },
  { n: 22, text: "Nicotinamide (Sigma, N0636) — dissolve in 0.9% sterile saline.", kind: "code" },
  { n: 23, text: "Working concentrations: STZ 55 mg/mL · NA 110 mg/mL.", kind: "code" },
  { n: 24, text: "", kind: "code" },
  { n: 25, text: "## 5. Induction Procedure", kind: "heading" },
  { n: 26, text: "Inject nicotinamide 110 mg/kg i.p. 15 min before STZ administration.", kind: "code" },
  { n: 27, text: "Administer STZ 55 mg/kg i.p. as a single dose.", kind: "code" },
  { n: 28, text: "Provide 5% glucose solution overnight to prevent hypoglycaemic mortality.", kind: "code" },
  { n: 29, text: "", kind: "code" },
  { n: 30, text: "## 6. Confirmation of Diabetes", kind: "heading" },
  { n: 31, text: "At 72 h post-induction, measure fasting blood glucose via tail-vein.", kind: "code" },
  { n: 32, text: "Use Accu-Chek Active glucometer; include only animals with FBG ≥ 250 mg/dL.", kind: "code" },
  { n: 33, text: "Re-confirm hyperglycaemia on day 7 prior to enrolment.", kind: "code" },
  { n: 34, text: "", kind: "code" },
  { n: 35, text: "## 7. Exclusion & Welfare", kind: "heading" },
  { n: 36, text: "Exclude animals with weight loss > 20% or humane endpoint signs.", kind: "code" },
  { n: 37, text: "Monitor twice daily for 7 days; provide softened chow as needed.", kind: "code" },
  { n: 38, text: "Supplier lot variability: record S0130 lot number for each cohort.", kind: "code" },
];

export const RISK_ANNOTATIONS: RiskAnnotation[] = [
  {
    line: 17,
    text: "10–14 h",
    severity: "medium",
    title: "Fasting window inconsistent",
    detail:
      "A 4-hour spread in pre-induction fasting introduces glycaemic variance and reduces reproducibility across cohorts.",
    suggestion: "Standardise fasting to 12 h ± 30 min and record start/end times per animal.",
  },
  {
    line: 21,
    text: "15 minutes",
    severity: "high",
    title: "STZ stability margin tight",
    detail:
      "STZ degrades rapidly in citrate buffer at pH 4.5. A 15-minute use window risks loss of potency by the last injection in a cohort >10 animals.",
    suggestion: "Reduce window to 10 min and prepare in two batches for cohorts ≥ 8 rats.",
  },
  {
    line: 27,
    text: "55 mg/kg",
    severity: "low",
    title: "Dose within published range",
    detail:
      "55 mg/kg with nicotinamide pretreatment falls within Masiello-style T2D induction range (50–65 mg/kg).",
    suggestion: "No change required. Confirm vehicle volume ≤ 2 mL/kg.",
  },
  {
    line: 32,
    text: "≥ 250 mg/dL",
    severity: "medium",
    title: "Confirmation threshold low for T2D model",
    detail:
      "For nicotinamide-protected T2D models, FBG cut-off of 250 mg/dL may include sub-diabetic animals; literature commonly uses ≥ 270 mg/dL.",
    suggestion: "Raise threshold to ≥ 270 mg/dL and add OGTT confirmation on day 7.",
  },
  {
    line: 38,
    text: "Supplier lot variability",
    severity: "high",
    title: "Lot variability not controlled",
    detail:
      "STZ potency varies between Sigma S0130 lots by up to 18%. Without per-cohort lot tracking, induction success rates cannot be compared across studies.",
    suggestion: "Lock a single lot per study arm; archive Certificate of Analysis.",
  },
];

export const PREFLIGHT_CHECKS: {
  label: string;
  state: "pass" | "warn" | "fail";
  note: string;
}[] = [
  { label: "ARRIVE 2.0 Essential 10 referenced", state: "pass", note: "All 10 items resolvable in protocol body." },
  { label: "STZ freshness handling", state: "warn", note: "Stability window may exceed safe potency margin." },
  { label: "Dose calculation (55 mg/kg)", state: "pass", note: "Within Masiello T2D induction range." },
  { label: "Fasting consistency", state: "warn", note: "Duration spread of 4 h across cohorts." },
  { label: "Supplier lot variability controlled", state: "fail", note: "No lot-locking strategy declared." },
  { label: "Humane endpoint criteria defined", state: "pass", note: ">20% weight loss documented." },
];

export const REASONING_STEPS = [
  { label: "Parsing protocol structure", status: "done" as const },
  { label: "Checking fasting protocol", status: "done" as const },
  { label: "Analyzing STZ stability window", status: "done" as const },
  { label: "Comparing dosage thresholds (PubMed n=143)", status: "active" as const },
  { label: "Reviewing induction consistency", status: "queued" as const },
  { label: "Cross-referencing ARRIVE 2.0 Essential 10", status: "queued" as const },
];

export type Citation = {
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi: string;
  confidence: number;
  abstract: string;
  linkedLine: number;
  linkedSection: string;
  evidence: string;
};

export const CITATIONS: Citation[] = [
  {
    authors: "Ghasemi A, Khalifi S, Jedi S.",
    year: 2014,
    title: "Streptozotocin-nicotinamide-induced rat model of type 2 diabetes",
    journal: "Acta Physiol Hung",
    doi: "10.1556/APhysiol.101.2014.4.2",
    confidence: 0.94,
    abstract:
      "Reviews the Masiello T2D model with nicotinamide pretreatment plus STZ in adult rats, including dose-response curves and confirmation thresholds.",
    linkedLine: 32,
    linkedSection: "§6 Confirmation of Diabetes",
    evidence:
      "FBG ≥ 270 mg/dL recommended for nicotinamide-protected models; 250 mg/dL retains sub-diabetic animals in 12–18% of cohorts.",
  },
  {
    authors: "Furman BL.",
    year: 2015,
    title: "Streptozotocin-Induced Diabetic Models in Mice and Rats",
    journal: "Curr Protoc Pharmacol",
    doi: "10.1002/0471141755.ph0547s70",
    confidence: 0.91,
    abstract:
      "Comprehensive protocols for STZ induction across rodent species, with discussion of dose ranges, vehicle preparation, and induction confirmation.",
    linkedLine: 21,
    linkedSection: "§4 STZ + Nicotinamide Preparation",
    evidence:
      "STZ in citrate buffer at pH 4.5 retains ≥ 95% potency for 10 min on ice; potency drops to 82% by minute 18.",
  },
  {
    authors: "Deeds MC, et al.",
    year: 2011,
    title: "Single-dose streptozotocin-induced diabetes: considerations for study design",
    journal: "Lab Anim",
    doi: "10.1258/la.2010.010090",
    confidence: 0.88,
    abstract:
      "Examines lot-to-lot STZ variability, vehicle stability, and the effect of fasting duration on induction reproducibility.",
    linkedLine: 38,
    linkedSection: "§7 Exclusion & Welfare",
    evidence:
      "Inter-lot Sigma S0130 potency varies up to 18%. Lot-locking per study arm is recommended to compare induction success rates.",
  },
  {
    authors: "Akinola OB, et al.",
    year: 2019,
    title: "Standardising overnight fasting in rodent metabolic studies in West African labs",
    journal: "Afr J Biomed Res",
    doi: "10.4314/ajbr.v22i2.4",
    confidence: 0.82,
    abstract:
      "Field study of fasting duration variance across Nigerian university animal houses; recommends 12 h ± 30 min for STZ-based induction.",
    linkedLine: 17,
    linkedSection: "§3 Pre-Induction Fasting",
    evidence:
      "A 4-hour fasting spread accounted for 23% of inter-cohort glycaemic variance in three Ibadan and Ife cohorts (n = 144).",
  },
  {
    authors: "du Sert NP, et al.",
    year: 2020,
    title: "The ARRIVE guidelines 2.0: Updated guidelines for reporting animal research",
    journal: "PLOS Biology",
    doi: "10.1371/journal.pbio.3000410",
    confidence: 0.79,
    abstract:
      "Updated reporting checklist for in vivo research; the Essential 10 covers study design, sample size, randomisation, blinding, and outcome measures.",
    linkedLine: 6,
    linkedSection: "§1 Animal Model & Ethics",
    evidence:
      "Essential 10 items 1–3 require explicit declaration of species, strain, sex, and ethics approval reference number.",
  },
];
