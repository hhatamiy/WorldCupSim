import { getFullCountryName } from './predictionLabels';

export function getStandingsFromBracket(champion, knockoutBracket) {
  const final = knockoutBracket?.final?.[0];
  const runnerUp =
    final?.winner && final?.team1 && final?.team2
      ? final.winner === final.team1
        ? final.team2
        : final.team1
      : '';
  const tpp = knockoutBracket?.thirdPlacePlayoff?.[0];
  let thirdPlace = '';
  let thirdPlaceRunnerUp = '';
  if (tpp?.winner && tpp.team1 && tpp.team2) {
    thirdPlace = tpp.winner;
    thirdPlaceRunnerUp = tpp.winner === tpp.team1 ? tpp.team2 : tpp.team1;
  }
  return {
    champion: champion || final?.winner || '',
    runnerUp,
    thirdPlace,
    thirdPlaceRunnerUp
  };
}

const ROUND_LABELS = ['Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals'];

/** Tabular rows for CSV / HTML (storage order, not visual reverse). */
export function flattenKnockoutMatchups(knockoutBracket) {
  if (!knockoutBracket) return [];
  const rows = [];
  for (const side of ['left', 'right']) {
    knockoutBracket[side].forEach((round, roundIndex) => {
      const stage = ROUND_LABELS[roundIndex] || `Round_${roundIndex}`;
      round.forEach((m, matchIndex) => {
        rows.push({
          side,
          stage,
          matchIndex,
          team1: m.team1 || '',
          team2: m.team2 || '',
          winner: m.winner || ''
        });
      });
    });
  }
  const f = knockoutBracket.final?.[0];
  if (f) {
    rows.push({
      side: 'center',
      stage: 'Final',
      matchIndex: 0,
      team1: f.team1 || '',
      team2: f.team2 || '',
      winner: f.winner || ''
    });
  }
  const t = knockoutBracket.thirdPlacePlayoff?.[0];
  if (t) {
    rows.push({
      side: 'center',
      stage: 'Third place playoff',
      matchIndex: 0,
      team1: t.team1 || '',
      team2: t.team2 || '',
      winner: t.winner || ''
    });
  }
  return rows;
}

export function getThirdPlaceAdvancingRows(groups, thirdPlaceTeams, selectedThirdPlaceGroups) {
  const sel = selectedThirdPlaceGroups instanceof Set
    ? selectedThirdPlaceGroups
    : new Set(selectedThirdPlaceGroups || []);
  const list = thirdPlaceTeams || [];
  return list
    .filter((item) => sel.has(item.groupName))
    .map((item) => ({
      group: item.groupName,
      team: item.team?.name || ''
    }));
}

export function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeCsvCell(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function formatTeamCell(s) {
  return getFullCountryName(s || '') || (s ? String(s) : '');
}
