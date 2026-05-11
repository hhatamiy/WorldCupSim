/** Label helpers shared by Predictor UI and export visuals */

export function extractCountryName(teamString) {
  if (!teamString) return '';
  let cleaned = teamString
    .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, '')
    .replace(/🏴[󠁁-󠁿]*/gu, '')
    .trim();
  return cleaned;
}

export function extractFlag(teamString) {
  if (!teamString) return '';
  const flagMatch = teamString.match(/[\u{1F1E6}-\u{1F1FF}]{2}|🏴[󠁁-󠁿]*/gu);
  return flagMatch ? flagMatch[0] : '';
}

export function getFullCountryName(teamString) {
  if (!teamString) return '';
  return teamString;
}

export function getCountryCode(teamString) {
  if (!teamString) return '';

  const flagMatch = teamString.match(/[\u{1F1E6}-\u{1F1FF}]{2}|🏴[󠁁-󠁿]*/gu);
  const flag = flagMatch ? flagMatch[0] : '';

  const countryName = extractCountryName(teamString);

  const specialCases = {
    'United States': 'USA',
    'DR Congo': 'DRC',
    'New Zealand': 'NZL',
    'South Africa': 'RSA',
    'South Korea': 'KOR',
    'Saudi Arabia': 'KSA',
    'Ivory Coast': 'CIV',
    'Cape Verde': 'CPV',
    'Bosnia and Herzegovina': 'BIH'
  };

  if (specialCases[countryName]) {
    return flag ? `${flag} ${specialCases[countryName]}` : specialCases[countryName];
  }

  const words = countryName.split(/\s+/);
  let code;
  if (words.length > 1) {
    code = words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
    if (code.length < 3 && words[0].length > 1) {
      code = (code + words[0].substring(1, 4 - code.length)).toUpperCase().substring(0, 3);
    }
  } else {
    code = countryName.substring(0, 3).toUpperCase();
  }

  return flag ? `${flag} ${code}` : code;
}
