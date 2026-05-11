import {
  escapeCsvCell,
  flattenKnockoutMatchups,
  formatTeamCell,
  getStandingsFromBracket,
  getThirdPlaceAdvancingRows
} from './predictionExportData';

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

export function buildPredictionCsv({
  groups,
  thirdPlaceTeams,
  selectedThirdPlaceGroups,
  knockoutBracket,
  champion,
  generatedAt
}) {
  const lines = [];
  lines.push('# World Cup 2026 Predictor export');
  lines.push(`# Generated,${escapeCsvCell(generatedAt)}`);
  lines.push('');

  lines.push('## Group stage');
  lines.push('group,position,team');
  const groupKeys = Object.keys(groups || {}).sort();
  for (const g of groupKeys) {
    const teams = groups[g]?.teams || [];
    teams.forEach((t, idx) => {
      lines.push([escapeCsvCell(g), idx + 1, escapeCsvCell(t.name)].join(','));
    });
  }
  lines.push('');

  lines.push('## Third place teams advancing (8)');
  lines.push('group,team');
  for (const row of getThirdPlaceAdvancingRows(groups, thirdPlaceTeams, selectedThirdPlaceGroups)) {
    lines.push([escapeCsvCell(row.group), escapeCsvCell(formatTeamCell(row.team))].join(','));
  }
  lines.push('');

  lines.push('## Knockout');
  lines.push('side,stage,match_index,team1,team2,winner');
  for (const m of flattenKnockoutMatchups(knockoutBracket)) {
    lines.push(
      [
        escapeCsvCell(m.side),
        escapeCsvCell(m.stage),
        m.matchIndex,
        escapeCsvCell(formatTeamCell(m.team1)),
        escapeCsvCell(formatTeamCell(m.team2)),
        escapeCsvCell(formatTeamCell(m.winner))
      ].join(',')
    );
  }
  lines.push('');

  const st = getStandingsFromBracket(champion, knockoutBracket);
  lines.push('## Final standings');
  lines.push('key,value');
  lines.push(`champion,${escapeCsvCell(formatTeamCell(st.champion))}`);
  lines.push(`runner_up,${escapeCsvCell(formatTeamCell(st.runnerUp))}`);
  lines.push(`third_place,${escapeCsvCell(formatTeamCell(st.thirdPlace))}`);
  lines.push(`third_place_runner_up,${escapeCsvCell(formatTeamCell(st.thirdPlaceRunnerUp))}`);

  return lines.join('\r\n');
}

export function downloadPredictionCsv(payload, basename) {
  const csv = buildPredictionCsv(payload);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${basename}.csv`);
}
