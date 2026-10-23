// Reusable service functions for the World Bank API
const BASE_URL = "https://api.worldbank.org/v2";

export const INDICATORS = {
  gdp: { code: "NY.GDP.MKTP.CD", label: "GDP (US$)" },
  gdpPerCapita: { code: "NY.GDP.PCAP.CD", label: "GDP per capita (US$)" },
  lifeExpectancy: { code: "SP.DYN.LE00.IN", label: "Life expectancy (years)" },
  internet: { code: "IT.NET.USER.ZS", label: "Internet users (% of population)" },
};

// Gets the most recent NON-EMPTY value of one indicator.
// Returns { value, year } or null when the World Bank has no data.
export async function fetchIndicator(countryCode, indicatorCode) {
  const url =
    BASE_URL + "/country/" + countryCode + "/indicator/" + indicatorCode +
    "?format=json&mrnev=1";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("World Bank responded with status " + response.status);
  }
  const data = await response.json();

  // data = [ metaInfo, [ {value, date}, ... ] ]  (or a message when invalid)
  const rows = data[1];
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  if (row.value === null || row.value === undefined) return null;
  return { value: row.value, year: row.date };
}

// Gets all 4 indicators for one country at the same time
export async function fetchAllIndicators(countryCode) {
  const results = await Promise.all([
    fetchIndicator(countryCode, INDICATORS.gdp.code),
    fetchIndicator(countryCode, INDICATORS.gdpPerCapita.code),
    fetchIndicator(countryCode, INDICATORS.lifeExpectancy.code),
    fetchIndicator(countryCode, INDICATORS.internet.code),
  ]);
  return {
    gdp: results[0],
    gdpPerCapita: results[1],
    lifeExpectancy: results[2],
    internet: results[3],
  };
}
