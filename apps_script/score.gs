/**
 * score.gs — RecruitmentTech
 * Calculates candidate score when the recruiter finishes filling skill ratings.
 *
 * HOW TO INSTALL:
 *   1. Open the Google Sheets linked to the Form
 *   2. Extensions > Apps Script > paste this file
 *   3. Save and set up the trigger:
 *      Triggers > Add Trigger > onEdit > From spreadsheet > On edit
 *
 * SHEETS COLUMN LAYOUT:
 *   Form columns (auto-filled by candidate):
 *     A  = Timestamp
 *     B  = Full Name
 *     C  = LinkedIn URL
 *
 *   Skill columns (filled by recruiter after LinkedIn review — scale 1-3):
 *     -- Hard Technical Skills (10 skills) --
 *     D  = Backend (Java / Python / Node.js)
 *     E  = Frontend (Angular / React / TypeScript)
 *     F  = Cloud (AWS / GCP / Azure)
 *     G  = AI / LLM Integration
 *     H  = DevOps / CI-CD
 *     I  = SQL & NoSQL Databases
 *     J  = Testing (Unit / Integration / E2E)
 *     K  = Security (OWASP / Auth / LGPD)
 *     L  = REST / GraphQL API Design
 *     M  = System Design
 *
 *     -- Hard Process Skills (10 skills) --
 *     N  = Git / Version Control
 *     O  = Software Architecture Patterns
 *     P  = Observability & Monitoring
 *     Q  = Prompt Engineering
 *     R  = Technical Documentation
 *     S  = Agile / Scrum
 *     T  = Code Review
 *     U  = Incident Response
 *     V  = Data Modelling
 *     W  = Performance Optimisation
 *
 *     -- Soft Skills (10 skills) --
 *     X  = Adaptability
 *     Y  = Critical Thinking
 *     Z  = Autonomy
 *     AA = Async Communication
 *     AB = Continuous Learning
 *     AC = Collaboration
 *     AD = Mentorship           ← used for Tech Leader rule (soft avg)
 *     AE = Complex Problem Solving
 *     AF = Ownership & Accountability
 *     AG = English Proficiency (C1/C2)
 *
 *     -- Leadership & Organisational Impact (10 skills) --
 *     AH = Stakeholder Management
 *     AI = Technical Vision & Roadmap
 *     AJ = Cross-functional Leadership
 *     AK = People Development
 *     AL = Hiring & Bar Raising
 *     AM = Executive Communication
 *     AN = Organisational Influence
 *     AO = Conflict & Alignment
 *     AP = Budget & Cost Awareness
 *     AQ = Strategic Prioritisation
 *
 *   Output columns (calculated by this script):
 *     AR = score_hard_tec     (avg 1-3)
 *     AS = score_hard_proc    (avg 1-3)
 *     AT = score_soft         (avg 1-3)
 *     AU = score_leadership   (avg 1-3)
 *     AV = score_total        (0-100)
 *     AW = profile
 *
 * SCALE: 1 = Learner | 2 = Practitioner | 3 = Teacher
 */

// ─── Column configuration (0-based index, A=0) ───────────────────────────────
const CONFIG = {
  COL_NOME: 1, // B — Full Name
  COL_LINKEDIN: 2, // C — LinkedIn URL

  // Hard Technical Skills: 10 skills (D=3 to M=12)
  HARD_TEC_START: 3,
  HARD_TEC_COUNT: 10,

  // Hard Process Skills: 10 skills (N=13 to W=22)
  HARD_PROC_START: 13,
  HARD_PROC_COUNT: 10,

  // Soft Skills: 10 skills (X=23 to AG=32)
  SOFT_START: 23,
  SOFT_COUNT: 10,

  // Leadership & Organisational Impact: 10 skills (AH=33 to AQ=42)
  LEADERSHIP_START: 33,
  LEADERSHIP_COUNT: 10,

  // Output columns (start at AR=43)
  OUT_SCORE_HARD_TEC: 43, // AR
  OUT_SCORE_HARD_PROC: 44, // AS
  OUT_SCORE_SOFT: 45, // AT
  OUT_SCORE_LEADERSHIP: 46, // AU
  OUT_SCORE_TOTAL: 47, // AV
  OUT_PERFIL: 48, // AW

  // Category weights (must sum to 1.0)
  PESO_HARD_TEC: 0.35,
  PESO_HARD_PROC: 0.25,
  PESO_SOFT: 0.25,
  PESO_LEADERSHIP: 0.15,

  // Profile thresholds (score 0-100)
  JUNIOR_MIN: 20,
  MIDLEVEL_MIN: 45,
  SENIOR_MIN: 65,
  TL_MIN: 80,

  // Additional rules for Senior / Tech Leader (scale 1-3)
  SENIOR_HARD_TEC_MIN: 2.3, // minimum avg hard technical for Senior
  TL_SOFT_MIN: 2.5, // minimum avg soft for Tech Leader
  TL_LEADERSHIP_MIN: 2.0, // minimum avg leadership for Tech Leader
  TL_MENTORIA_COL: 29, // AD = Mentorship column (0-based, within soft block)
  TL_MENTORIA_MIN: 3, // Mentorship must be 3 (Teacher) for Tech Leader

  // Total columns read per row
  TOTAL_COLS: 52,
};

// ─── onEdit trigger — fires when recruiter fills any skill cell ───────────────
function onEdit(e) {
  const sheet = e.range.getSheet();
  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Only process rows below the header and within skill columns (D to AQ = 4 to 43)
  if (row < 2) return;
  if (col < 4 || col > 43) return;

  const rowData = sheet.getRange(row, 1, 1, CONFIG.TOTAL_COLS).getValues()[0];

  // Only calculate when all 40 skill cells are filled (no empty/zero values)
  const skillCells = rowData.slice(
    CONFIG.HARD_TEC_START,
    CONFIG.LEADERSHIP_START + CONFIG.LEADERSHIP_COUNT,
  );
  const allFilled = skillCells.every(
    (v) => v !== "" && v !== null && Number(v) >= 1,
  );
  if (!allFilled) return;

  const scores = calcularScore(rowData);
  const perfil = classificarPerfil(scores, rowData);

  sheet
    .getRange(row, CONFIG.OUT_SCORE_HARD_TEC + 1)
    .setValue(scores.hardTec.toFixed(2));
  sheet
    .getRange(row, CONFIG.OUT_SCORE_HARD_PROC + 1)
    .setValue(scores.hardProc.toFixed(2));
  sheet
    .getRange(row, CONFIG.OUT_SCORE_SOFT + 1)
    .setValue(scores.soft.toFixed(2));
  sheet
    .getRange(row, CONFIG.OUT_SCORE_LEADERSHIP + 1)
    .setValue(scores.leadership.toFixed(2));
  sheet
    .getRange(row, CONFIG.OUT_SCORE_TOTAL + 1)
    .setValue(scores.total.toFixed(1));
  sheet.getRange(row, CONFIG.OUT_PERFIL + 1).setValue(perfil);

  // Add output headers if this is the first candidate
  if (row === 2) addOutputHeaders(sheet);

  // Notify recruiter if candidate scores Senior or above
  const nome = rowData[CONFIG.COL_NOME] || "N/A";
  const linkedin = rowData[CONFIG.COL_LINKEDIN] || "N/A";
  notificarRecrutador({ nome, linkedin }, scores, perfil);
}

// ─── Score calculation ────────────────────────────────────────────────────────
function calcularScore(row) {
  const hardTecNotas = row.slice(
    CONFIG.HARD_TEC_START,
    CONFIG.HARD_TEC_START + CONFIG.HARD_TEC_COUNT,
  );
  const hardProcNotas = row.slice(
    CONFIG.HARD_PROC_START,
    CONFIG.HARD_PROC_START + CONFIG.HARD_PROC_COUNT,
  );
  const softNotas = row.slice(
    CONFIG.SOFT_START,
    CONFIG.SOFT_START + CONFIG.SOFT_COUNT,
  );
  const leaderNotas = row.slice(
    CONFIG.LEADERSHIP_START,
    CONFIG.LEADERSHIP_START + CONFIG.LEADERSHIP_COUNT,
  );

  const avg = (arr) =>
    arr.reduce((s, v) => s + (Number(v) || 0), 0) / arr.length;

  const hardTec = avg(hardTecNotas);
  const hardProc = avg(hardProcNotas);
  const soft = avg(softNotas);
  const leadership = avg(leaderNotas);

  // Normalise to 0-100 (scale max = 3)
  const total =
    ((hardTec * CONFIG.PESO_HARD_TEC +
      hardProc * CONFIG.PESO_HARD_PROC +
      soft * CONFIG.PESO_SOFT +
      leadership * CONFIG.PESO_LEADERSHIP) /
      3) *
    100;

  return { hardTec, hardProc, soft, leadership, total };
}

// ─── Profile classification ───────────────────────────────────────────────────
function classificarPerfil(scores, row) {
  const { total, hardTec, soft, leadership } = scores;
  const mentorship = Number(row[CONFIG.TL_MENTORIA_COL]) || 0;

  if (
    total >= CONFIG.TL_MIN &&
    soft >= CONFIG.TL_SOFT_MIN &&
    leadership >= CONFIG.TL_LEADERSHIP_MIN &&
    mentorship >= CONFIG.TL_MENTORIA_MIN
  ) {
    return "Tech Leader";
  }
  if (total >= CONFIG.SENIOR_MIN && hardTec >= CONFIG.SENIOR_HARD_TEC_MIN) {
    return "Senior";
  }
  if (total >= CONFIG.MIDLEVEL_MIN) {
    return "Mid-level";
  }
  if (total >= CONFIG.JUNIOR_MIN) {
    return "Junior";
  }
  return "Below minimum profile";
}

// ─── Output column headers ────────────────────────────────────────────────────
function addOutputHeaders(sheet) {
  [
    "score_hard_tec",
    "score_hard_proc",
    "score_soft",
    "score_leadership",
    "score_total",
    "profile",
  ].forEach((h, i) => {
    sheet.getRange(1, CONFIG.OUT_SCORE_HARD_TEC + 1 + i).setValue(h);
  });
}

// ─── Utility: recalculate all existing candidates ─────────────────────────────
// Run manually from the Apps Script editor when needed
function recalcularTodos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  let count = 0;

  for (let r = 2; r <= lastRow; r++) {
    const row = sheet.getRange(r, 1, 1, CONFIG.TOTAL_COLS).getValues()[0];
    if (!row[CONFIG.COL_NOME]) continue;

    const scores = calcularScore(row);
    const perfil = classificarPerfil(scores, row);

    sheet
      .getRange(r, CONFIG.OUT_SCORE_HARD_TEC + 1)
      .setValue(scores.hardTec.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_HARD_PROC + 1)
      .setValue(scores.hardProc.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_SOFT + 1)
      .setValue(scores.soft.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_LEADERSHIP + 1)
      .setValue(scores.leadership.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_TOTAL + 1)
      .setValue(scores.total.toFixed(1));
    sheet.getRange(r, CONFIG.OUT_PERFIL + 1).setValue(perfil);
    count++;
  }

  SpreadsheetApp.getUi().alert(
    `Recalculation complete — ${count} candidates processed.`,
  );
}

// ─── Configuração de colunas (índice 0 = coluna A) ───────────────────────────
const CONFIG = {
  COL_NOME: 1, // B
  COL_EMAIL: 2, // C
  COL_FUNCAO: 3, // D
  COL_NIVEL: 4, // E

  // Hard Técnicas: 8 skills (F=5 até M=12)
  HARD_TEC_START: 5,
  HARD_TEC_COUNT: 8,

  // Hard Processo: 6 skills (N=13 até S=18)
  HARD_PROC_START: 13,
  HARD_PROC_COUNT: 6,

  // Soft Skills: 8 skills (T=19 até AA=26)
  SOFT_START: 19,
  SOFT_COUNT: 8,

  // Colunas de saída (começam em AB=27)
  OUT_SCORE_HARD_TEC: 27, // AB
  OUT_SCORE_HARD_PROC: 28, // AC
  OUT_SCORE_SOFT: 29, // AD
  OUT_SCORE_TOTAL: 30, // AE
  OUT_PERFIL: 31, // AF

  // Pesos das categorias (devem somar 1.0)
  PESO_HARD_TEC: 0.4,
  PESO_HARD_PROC: 0.3,
  PESO_SOFT: 0.3,

  // Thresholds de perfil (score 0-100)
  JUNIOR_MIN: 20,
  PLENO_MIN: 45,
  SENIOR_MIN: 65,
  TL_MIN: 80,

  // Regras adicionais para Senior / Tech Leader (escala 1-3)
  SENIOR_HARD_TEC_MIN: 2.3, // média hard técnico mínima para Senior
  TL_SOFT_MIN: 2.5, // média soft mínima para TL
  TL_MENTORIA_COL: 26, // coluna AA = nota de Mentoria (índice 0)
  TL_MENTORIA_MIN: 3, // Mentoria = 3 (Ensina) obrigatório para TL
};

// ─── Trigger principal ────────────────────────────────────────────────────────
function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const row = sheet.getRange(lastRow, 1, 1, 40).getValues()[0];

  const scores = calcularScore(row);
  const perfil = classificarPerfil(scores, row);

  // Escreve resultados nas colunas de saída
  sheet
    .getRange(lastRow, CONFIG.OUT_SCORE_HARD_TEC + 1)
    .setValue(scores.hardTec.toFixed(2));
  sheet
    .getRange(lastRow, CONFIG.OUT_SCORE_HARD_PROC + 1)
    .setValue(scores.hardProc.toFixed(2));
  sheet
    .getRange(lastRow, CONFIG.OUT_SCORE_SOFT + 1)
    .setValue(scores.soft.toFixed(2));
  sheet
    .getRange(lastRow, CONFIG.OUT_SCORE_TOTAL + 1)
    .setValue(scores.total.toFixed(1));
  sheet.getRange(lastRow, CONFIG.OUT_PERFIL + 1).setValue(perfil);

  // Adiciona cabeçalhos se for a primeira resposta
  if (lastRow === 2) adicionarCabecalhosOutput(sheet);
}

// ─── Cálculo de score ─────────────────────────────────────────────────────────
function calcularScore(row) {
  const hardTecNotas = row.slice(
    CONFIG.HARD_TEC_START,
    CONFIG.HARD_TEC_START + CONFIG.HARD_TEC_COUNT,
  );
  const hardProcNotas = row.slice(
    CONFIG.HARD_PROC_START,
    CONFIG.HARD_PROC_START + CONFIG.HARD_PROC_COUNT,
  );
  const softNotas = row.slice(
    CONFIG.SOFT_START,
    CONFIG.SOFT_START + CONFIG.SOFT_COUNT,
  );

  const media = (arr) =>
    arr.reduce((s, v) => s + (Number(v) || 0), 0) / arr.length;

  const hardTec = media(hardTecNotas);
  const hardProc = media(hardProcNotas);
  const soft = media(softNotas);

  // Score total normalizado 0-100 (escala 1-3 → divide por 3)
  const total =
    ((hardTec * CONFIG.PESO_HARD_TEC +
      hardProc * CONFIG.PESO_HARD_PROC +
      soft * CONFIG.PESO_SOFT) /
      3) *
    100;

  return { hardTec, hardProc, soft, total };
}

// ─── Classificação de perfil ──────────────────────────────────────────────────
function classificarPerfil(scores, row) {
  const { total, hardTec, soft } = scores;
  const notaMentoria = Number(row[CONFIG.TL_MENTORIA_COL]) || 0;

  if (
    total >= CONFIG.TL_MIN &&
    soft >= CONFIG.TL_SOFT_MIN &&
    notaMentoria >= CONFIG.TL_MENTORIA_MIN
  ) {
    return "Tech Leader";
  }
  if (total >= CONFIG.SENIOR_MIN && hardTec >= CONFIG.SENIOR_HARD_TEC_MIN) {
    return "Senior";
  }
  if (total >= CONFIG.PLENO_MIN) {
    return "Pleno";
  }
  if (total >= CONFIG.JUNIOR_MIN) {
    return "Junior";
  }
  return "Abaixo do perfil minimo";
}

// ─── Cabeçalhos das colunas de saída ─────────────────────────────────────────
function adicionarCabecalhosOutput(sheet) {
  const headers = [
    "score_hard_tec",
    "score_hard_proc",
    "score_soft",
    "score_total",
    "perfil_classificado",
  ];
  headers.forEach((h, i) => {
    sheet.getRange(1, CONFIG.OUT_SCORE_HARD_TEC + 1 + i).setValue(h);
  });
}

// ─── Utilitário: recalcular todos os candidatos existentes ───────────────────
// Rode manualmente via Apps Script editor quando precisar reprocessar
function recalcularTodos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  for (let r = 2; r <= lastRow; r++) {
    const row = sheet.getRange(r, 1, 1, 40).getValues()[0];
    if (!row[CONFIG.COL_NOME]) continue;

    const scores = calcularScore(row);
    const perfil = classificarPerfil(scores, row);

    sheet
      .getRange(r, CONFIG.OUT_SCORE_HARD_TEC + 1)
      .setValue(scores.hardTec.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_HARD_PROC + 1)
      .setValue(scores.hardProc.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_SOFT + 1)
      .setValue(scores.soft.toFixed(2));
    sheet
      .getRange(r, CONFIG.OUT_SCORE_TOTAL + 1)
      .setValue(scores.total.toFixed(1));
    sheet.getRange(r, CONFIG.OUT_PERFIL + 1).setValue(perfil);
  }

  SpreadsheetApp.getUi().alert(
    "Recalculo concluido para " + (lastRow - 1) + " candidatos.",
  );
}
