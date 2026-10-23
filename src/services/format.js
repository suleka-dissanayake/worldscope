// small helper functions used by many components
export function formatNumber(n) {
  if (n === null || n === undefined) return "N/A";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatMoney(n) {
  if (n === null || n === undefined) return "N/A";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + " T";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + " M";
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

// turns an object like {eng:"English"} into ["English"]
export function objectValues(obj) {
  if (!obj) return [];
  return Object.values(obj);
}

// currencies look like { LKR: { name: "Sri Lankan rupee", symbol: "Rs" } }
export function currencyList(obj) {
  if (!obj) return [];
  return Object.values(obj).map((c) => c.name + (c.symbol ? " (" + c.symbol + ")" : ""));
}
