/**
 * trigger_email.gs — RecruitmentTech
 * Sends an email to the recruiter when a candidate scores Senior or above.
 *
 * HOW TO CONFIGURE:
 *   1. Change RECRUITER_EMAIL below if needed.
 *   2. This function is called automatically from score.gs > onEdit().
 *   3. Only fires when total score >= SCORE_ALERT_MINIMUM.
 */

const RECRUITER_EMAIL = "wesley.zilva@gmail.com";
const SCORE_ALERT_MINIMUM = 65; // notify for Senior and above

/**
 * @param {{ nome: string, linkedin: string }} candidate
 * @param {{ hardTec: number, hardProc: number, soft: number, leadership: number, total: number }} scores
 * @param {string} profile
 */
function notificarRecrutador(candidate, scores, profile) {
  if (scores.total < SCORE_ALERT_MINIMUM) return;

  const subject = `[RecruitmentTech] New ${profile} candidate: ${candidate.nome} — Score ${scores.total.toFixed(1)}`;

  const body = `
A candidate has been evaluated and scored ${profile}:

Full Name:     ${candidate.nome}
LinkedIn:      ${candidate.linkedin}

--- SCORES (scale 1–3) ---
Hard Technical:  ${scores.hardTec.toFixed(2)} / 3
Hard Process:    ${scores.hardProc.toFixed(2)} / 3
Soft Skills:     ${scores.soft.toFixed(2)} / 3
Leadership:      ${scores.leadership.toFixed(2)} / 3
Total Score:     ${scores.total.toFixed(1)} / 100
Profile:         ${profile}

---
Open Google Sheets to review all candidates or export CSV.
  `.trim();

  MailApp.sendEmail(RECRUITER_EMAIL, subject, body);
  Logger.log(`Email sent to ${RECRUITER_EMAIL} — candidate: ${candidate.nome}`);
}
