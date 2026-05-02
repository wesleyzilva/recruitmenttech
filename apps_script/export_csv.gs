/**
 * export_csv.gs — RecruitmentTech
 * Exports candidates to CSV in Google Drive, sorted by score_total descending.
 *
 * HOW TO USE:
 *   1. Paste into the same Apps Script project as score.gs.
 *   2. Run exportCSV() manually or schedule via Trigger (daily/weekly).
 *   3. The CSV is saved to the root of Google Drive as: candidates_YYYY-MM-DD.csv
 *
 * COLUMN LAYOUT (0-based index):
 *   0  = Timestamp  |  1 = Full Name  |  2 = LinkedIn URL
 *   3–12  = Hard Technical skills (10)
 *   13–22 = Hard Process skills   (10)
 *   23–32 = Soft skills            (10)
 *   33–42 = Leadership skills      (10)
 *   43–52 = Company & Culture skills (10)
 *   53 = score_hard_tec | 54 = score_hard_proc | 55 = score_soft
 *   56 = score_leadership | 57 = score_company | 58 = score_total | 59 = profile
 */

function exportCSV() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getUi().alert("No candidates found.");
    return;
  }

  const COLUNAS_CSV = [
    { header: "full_name", idx: 1 },
    { header: "linkedin_url", idx: 2 },
    { header: "score_hard_tec", idx: 53 },
    { header: "score_hard_proc", idx: 54 },
    { header: "score_soft", idx: 55 },
    { header: "score_leadership", idx: 56 },
    { header: "score_company", idx: 57 },
    { header: "score_total", idx: 58 },
    { header: "profile", idx: 59 },
    { header: "scored_date", idx: 0 },
  ];

  // Only rows with a calculated score (col 58 filled)
  const candidatos = data
    .slice(1)
    .filter((row) => row[58] !== "" && row[58] !== undefined);

  // Sort by score_total descending
  candidatos.sort((a, b) => Number(b[58]) - Number(a[58]));

  // Build CSV
  const linhas = [COLUNAS_CSV.map((c) => c.header).join(",")];

  candidatos.forEach((row) => {
    const linha = COLUNAS_CSV.map((c) => {
      const val = row[c.idx];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") ? `"${str}"` : str;
    });
    linhas.push(linha.join(","));
  });

  const csvContent = linhas.join("\n");

  // Save to Google Drive
  const today = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );
  const fileName = `candidates_${today}.csv`;

  // Remove previous version from the same day if it exists
  const existing = DriveApp.getFilesByName(fileName);
  while (existing.hasNext()) existing.next().setTrashed(true);

  const file = DriveApp.createFile(fileName, csvContent, MimeType.CSV);

  SpreadsheetApp.getUi().alert(
    `CSV exported: ${fileName}\n${candidatos.length} candidates exported.\nURL: ${file.getUrl()}`,
  );

  Logger.log("CSV exported: " + file.getUrl());
}
