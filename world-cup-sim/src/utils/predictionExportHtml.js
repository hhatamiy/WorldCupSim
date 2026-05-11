import {
  escapeHtml,
  flattenKnockoutMatchups,
  formatTeamCell,
  getStandingsFromBracket,
  getThirdPlaceAdvancingRows
} from './predictionExportData';

const STYLES = `
:root { color-scheme: dark; }
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: linear-gradient(135deg, #0a1a2a, #003b5c);
  color: #fff;
  line-height: 1.5;
  padding: 24px;
}
h1 { font-size: 1.75rem; margin: 0 0 8px; }
.sub { opacity: 0.85; font-size: 0.95rem; margin-bottom: 28px; }
section { margin-bottom: 32px; }
h2 {
  font-size: 1.1rem;
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid rgba(0, 255, 120, 0.35);
}
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; padding: 8px 10px; border: 1px solid rgba(255,255,255,0.12); }
th { background: rgba(255,255,255,0.08); }
tr:nth-child(even) td { background: rgba(255,255,255,0.04); }
.standings { max-width: 520px; }
.standings td:first-child { font-weight: 600; width: 42%; }
@media (max-width: 640px) {
  body { padding: 16px; }
  table { font-size: 0.8rem; }
}
`;

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function buildPredictionHtmlDocument(payload) {
  const { groups, thirdPlaceTeams, selectedThirdPlaceGroups, knockoutBracket, champion, generatedAt } = payload;
  const st = getStandingsFromBracket(champion, knockoutBracket);
  const thirdRows = getThirdPlaceAdvancingRows(groups, thirdPlaceTeams, selectedThirdPlaceGroups);
  const groupKeys = Object.keys(groups || {}).sort();

  let groupRows = '';
  for (const g of groupKeys) {
    const teams = groups[g]?.teams || [];
    teams.forEach((t, idx) => {
      groupRows += `<tr><td>${escapeHtml(g)}</td><td>${idx + 1}</td><td>${escapeHtml(formatTeamCell(t.name))}</td></tr>`;
    });
  }

  let thirdHtml = '';
  for (const row of thirdRows) {
    thirdHtml += `<tr><td>${escapeHtml(row.group)}</td><td>${escapeHtml(formatTeamCell(row.team))}</td></tr>`;
  }

  let koRows = '';
  for (const m of flattenKnockoutMatchups(knockoutBracket)) {
    koRows += `<tr><td>${escapeHtml(m.side)}</td><td>${escapeHtml(m.stage)}</td><td>${m.matchIndex}</td>`;
    koRows += `<td>${escapeHtml(formatTeamCell(m.team1))}</td><td>${escapeHtml(formatTeamCell(m.team2))}</td>`;
    koRows += `<td>${escapeHtml(formatTeamCell(m.winner))}</td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>World Cup 2026 — My prediction</title>
  <style>${STYLES}</style>
</head>
<body>
  <h1>World Cup 2026 Predictor</h1>
  <p class="sub">Exported ${escapeHtml(generatedAt)}</p>

  <section class="standings">
    <h2>Final standings</h2>
    <table>
      <tr><td>Champion</td><td>${escapeHtml(formatTeamCell(st.champion))}</td></tr>
      <tr><td>Runner-up</td><td>${escapeHtml(formatTeamCell(st.runnerUp)) || '—'}</td></tr>
      <tr><td>Third place</td><td>${escapeHtml(formatTeamCell(st.thirdPlace)) || '—'}</td></tr>
      <tr><td>Fourth place</td><td>${escapeHtml(formatTeamCell(st.thirdPlaceRunnerUp)) || '—'}</td></tr>
    </table>
  </section>

  <section>
    <h2>Group stage</h2>
    <table>
      <thead><tr><th>Group</th><th>Position</th><th>Team</th></tr></thead>
      <tbody>${groupRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Third place teams advancing</h2>
    <table>
      <thead><tr><th>Group</th><th>Team (3rd in group)</th></tr></thead>
      <tbody>${thirdHtml}</tbody>
    </table>
  </section>

  <section>
    <h2>Knockout bracket (results)</h2>
    <table>
      <thead><tr><th>Side</th><th>Stage</th><th>#</th><th>Team 1</th><th>Team 2</th><th>Winner</th></tr></thead>
      <tbody>${koRows}</tbody>
    </table>
  </section>
</body>
</html>`;
}

export function downloadPredictionHtml(payload, basename) {
  const html = buildPredictionHtmlDocument(payload);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${basename}.html`);
}
