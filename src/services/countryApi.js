// Country data now comes from the World Bank API
const WB_URL = "https://api.worldbank.org/v2";

// helper: fetch + check status + return json
async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Server responded with status " + response.status);
  }
  return response.json();
}

// World Bank answers look like [ metaInfo, [ ...rows ] ]
function getRows(data) {
  if (!Array.isArray(data) || !Array.isArray(data[1])) return [];
  return data[1];
}

// Turns rows of one indicator into an object like { LKA: 22000000, IND: ... }
// Keeps the most recent year that has a real value for every country.
function latestValuesByCountry(rows) {
  const latest = {}; // code -> { value, year }
  for (const row of rows) {
    const code = row.countryiso3code;
    if (!code || row.value === null || row.value === undefined) continue;
    const year = Number(row.date);
    if (!latest[code] || year > latest[code].year) {
      latest[code] = { value: row.value, year: year };
    }
  }
  return latest;
}

// Gets the list of countries + population + land area, then joins them together.
export async function fetchAllCountries() {
  const listUrl = WB_URL + "/country?format=json&per_page=400";
  const popUrl = WB_URL + "/country/all/indicator/SP.POP.TOTL?format=json&per_page=20000&mrnev=1";
  const areaUrl = WB_URL + "/country/all/indicator/AG.LND.TOTL.K2?format=json&per_page=20000&mrnev=1";

  // run the 3 requests at the same time
  const results = await Promise.all([getJson(listUrl), getJson(popUrl), getJson(areaUrl)]);

  const countryRows = getRows(results[0]);
  const population = latestValuesByCountry(getRows(results[1]));
  const area = latestValuesByCountry(getRows(results[2]));

  if (countryRows.length === 0) {
    throw new Error("The World Bank returned no countries");
  }

  const countries = [];
  for (const row of countryRows) {
    // the list also contains groups like "World" or "Euro area" - skip them
    if (!row.region || row.region.value === "Aggregates") continue;

    const code = row.id; // 3-letter code, e.g. LKA
    const iso2 = row.iso2Code ? row.iso2Code.toLowerCase() : "";

    countries.push({
      name: { common: row.name, official: row.name },
      cca3: code,
      flags: {
        svg: "https://flagcdn.com/" + iso2 + ".svg",
        png: "https://flagcdn.com/w320/" + iso2 + ".png",
      },
      capital: row.capitalCity ? [row.capitalCity] : [],
      region: row.region.value,
      incomeLevel: row.incomeLevel ? row.incomeLevel.value : "N/A",
      population: population[code] ? population[code].value : null,
      populationYear: population[code] ? population[code].year : null,
      area: area[code] ? area[code].value : null,
    });
  }

  return countries;
}

// OPTIONAL extra: languages, currencies and borders are not in the World Bank API.
// We try REST Countries for them, and quietly return null if it does not work.
export async function fetchCountryExtras(code) {
  try {
    const url = "https://restcountries.com/v3.1/alpha/" + code + "?fields=languages,currencies,borders";
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (err) {
    return null;
  }
}
