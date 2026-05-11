import { forwardRef, useMemo } from 'react';
import { calculateMatchupTop } from '../utils/bracketLayout';
import { getCountryCode, getFullCountryName } from '../utils/predictionLabels';
import { getStandingsFromBracket } from '../utils/predictionExportData';
import './PredictionExportVisual.css';

function r32Team1Class(m) {
  if (!m.team1) return 'pex-team empty';
  const c = ['pex-team'];
  if (m.winner === m.team1) c.push('winner');
  else if (m.winner) c.push('loser');
  c.push(m.team2 ? 'set' : 'wait');
  return c.join(' ');
}

function r32Team2Class(m) {
  if (!m.team2) return 'pex-team empty';
  const c = ['pex-team'];
  if (m.winner === m.team2) c.push('winner');
  else if (m.winner) c.push('loser');
  c.push(m.team1 ? 'set' : 'wait');
  return c.join(' ');
}

function finalTeamClass(m, slot) {
  const team = m[slot];
  if (!team) return 'pex-team full empty';
  const c = ['pex-team', 'full'];
  if (m.winner === team) {
    c.push('winner', 'set');
  } else if (m.winner) {
    c.push('loser', 'set');
  } else {
    if (slot === 'team1' && m.team2) c.push('wait');
    if (slot === 'team2' && m.team1) c.push('wait');
  }
  return c.join(' ');
}

const PredictionExportVisual = forwardRef(function PredictionExportVisual(
  { groups, knockoutBracket, champion, selectedThirdPlaceGroups, thirdPlaceTeams, generatedAt },
  ref
) {
  const standings = useMemo(
    () => getStandingsFromBracket(champion, knockoutBracket),
    [champion, knockoutBracket]
  );

  const groupKeys = useMemo(() => Object.keys(groups || {}).sort(), [groups]);

  const selectedSet =
    selectedThirdPlaceGroups instanceof Set
      ? selectedThirdPlaceGroups
      : new Set(selectedThirdPlaceGroups || []);

  if (!knockoutBracket) return null;

  return (
    <div ref={ref} className="pex-capture-root" aria-hidden="true">
      <header className="pex-header">
        <h1>World Cup 2026 Predictor</h1>
        <p className="pex-sub">{generatedAt}</p>
      </header>

      <div className="pex-standings">
        <div className="pex-stand champ">Champion: {getFullCountryName(standings.champion) || '—'}</div>
        <div className="pex-stand">Runner-up: {getFullCountryName(standings.runnerUp) || '—'}</div>
        <div className="pex-stand">3rd: {getFullCountryName(standings.thirdPlace) || '—'}</div>
        <div className="pex-stand">4th: {getFullCountryName(standings.thirdPlaceRunnerUp) || '—'}</div>
      </div>

      <section className="pex-groups">
        <h2>Group stage</h2>
        <div className="pex-groups-grid">
          {groupKeys.map((groupName) => {
            const teams = groups[groupName]?.teams || [];
            return (
              <div key={groupName} className="pex-group-card">
                <h3>Group {groupName}</h3>
                {teams.map((team, index) => (
                  <div
                    key={`${groupName}-${index}`}
                    className={`pex-group-team ${index <= 1 ? 'pos12' : index === 2 ? 'pos3' : 'pos4'}`}
                  >
                    <span className="pex-posn">{index + 1}.</span>
                    <span>{team.name}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section className="pex-bracket-wrap">
        <h2>Knockout bracket</h2>
        <div className="pex-bracket-tree">
          <div className="pex-bracket-half pex-bracket-left">
            {[...knockoutBracket.left].reverse().map((round, reversedRoundIndex) => {
              const roundIndex = knockoutBracket.left.length - 1 - reversedRoundIndex;
              return (
                <div key={`L-${roundIndex}`} className="pex-round">
                  <div className="pex-round-label">
                    {roundIndex === 0 && 'Round of 32'}
                    {roundIndex === 1 && 'Round of 16'}
                    {roundIndex === 2 && 'Quarterfinals'}
                    {roundIndex === 3 && 'Semifinals'}
                  </div>
                  <div className="pex-round-matchups">
                    {round.map((matchup, matchupIndex) => {
                      const topPosition = calculateMatchupTop(roundIndex, matchupIndex, round.length);
                      return (
                        <div
                          key={matchupIndex}
                          className="pex-matchup-wrap"
                          style={{ top: `${topPosition}px` }}
                        >
                          <div className="pex-matchup">
                            <div className={r32Team1Class(matchup)}>
                              {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                            </div>
                            <div className="pex-vs">vs</div>
                            <div className={r32Team2Class(matchup)}>
                              {matchup.team2 ? getCountryCode(matchup.team2) : 'TBD'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pex-bracket-center">
            {champion && (
              <div className="pex-champ-banner">
                <h3>Champion</h3>
                <div className="pex-champ-name">{champion}</div>
              </div>
            )}
            <div className="pex-round-label">Final</div>
            {knockoutBracket.final.map((matchup, matchupIndex) => (
              <div key={matchupIndex} className="pex-final-wrap">
                <div className="pex-matchup final">
                  <div className={finalTeamClass(matchup, 'team1')}>
                    {matchup.team1 ? getFullCountryName(matchup.team1) : 'TBD'}
                  </div>
                  <div className="pex-vs">vs</div>
                  <div className={finalTeamClass(matchup, 'team2')}>
                    {matchup.team2 ? getFullCountryName(matchup.team2) : 'TBD'}
                  </div>
                </div>
                {matchup.winner && (
                  <div className="pex-champ-box">{getFullCountryName(matchup.winner)}</div>
                )}
              </div>
            ))}

            {knockoutBracket.thirdPlacePlayoff?.length > 0 && (
              <div className="pex-third-wrap">
                <div className="pex-round-label">3rd Place</div>
                {knockoutBracket.thirdPlacePlayoff.map((matchup, matchupIndex) => (
                  <div key={matchupIndex} className="pex-matchup third">
                    <div className={finalTeamClass(matchup, 'team1')}>
                      {matchup.team1 ? getFullCountryName(matchup.team1) : 'TBD'}
                    </div>
                    <div className="pex-vs">vs</div>
                    <div className={finalTeamClass(matchup, 'team2')}>
                      {matchup.team2 ? getFullCountryName(matchup.team2) : 'TBD'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pex-bracket-half pex-bracket-right">
            {[...knockoutBracket.right].reverse().map((round, reversedRoundIndex) => {
              const roundIndex = knockoutBracket.right.length - 1 - reversedRoundIndex;
              return (
                <div key={`R-${roundIndex}`} className="pex-round">
                  <div className="pex-round-label">
                    {roundIndex === 0 && 'Round of 32'}
                    {roundIndex === 1 && 'Round of 16'}
                    {roundIndex === 2 && 'Quarterfinals'}
                    {roundIndex === 3 && 'Semifinals'}
                  </div>
                  <div className="pex-round-matchups">
                    {[...round].reverse().map((matchup, reversedIdx) => {
                      const matchupIndex = round.length - 1 - reversedIdx;
                      const topPosition = calculateMatchupTop(roundIndex, matchupIndex, round.length);
                      return (
                        <div
                          key={matchupIndex}
                          className="pex-matchup-wrap"
                          style={{ top: `${topPosition}px` }}
                        >
                          <div className="pex-matchup">
                            <div className={r32Team1Class(matchup)}>
                              {matchup.team1 ? getCountryCode(matchup.team1) : 'TBD'}
                            </div>
                            <div className="pex-vs">vs</div>
                            <div className={r32Team2Class(matchup)}>
                              {matchup.team2 ? getCountryCode(matchup.team2) : 'TBD'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pex-groups" style={{ marginTop: 16 }}>
        <h2>Third place teams selected to advance</h2>
        <div className="pex-groups-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {(thirdPlaceTeams || [])
            .filter((item) => selectedSet.has(item.groupName))
            .map((item) => (
              <div key={item.groupName} className="pex-group-card">
                <h3>Group {item.groupName}</h3>
                <div className="pex-group-team pos3">
                  <span>{item.team?.name}</span>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
});

export default PredictionExportVisual;
