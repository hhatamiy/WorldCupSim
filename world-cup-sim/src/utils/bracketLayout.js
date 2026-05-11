/**
 * Vertical position for bracket matchups (same math as interactive bracket).
 */
export function calculateMatchupTop(roundIndex, matchupIndex, totalMatchupsInRound, containerHeight = 1200) {
  if (roundIndex === 0) {
    const topPadding = 20;
    const availableHeight = containerHeight - topPadding * 2;
    const spacing = availableHeight / (totalMatchupsInRound - 1);
    return topPadding + spacing * matchupIndex;
  }
  const parentRoundMatchups = totalMatchupsInRound * 2;
  const parentRoundIndex = roundIndex - 1;
  const parent1Top = calculateMatchupTop(parentRoundIndex, 2 * matchupIndex, parentRoundMatchups, containerHeight);
  const parent2Top = calculateMatchupTop(parentRoundIndex, 2 * matchupIndex + 1, parentRoundMatchups, containerHeight);
  return (parent1Top + parent2Top) / 2;
}
