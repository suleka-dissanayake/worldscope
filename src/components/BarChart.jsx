import { formatNumber } from "../services/format.js";

// A simple bar chart made with plain divs and CSS.
// data = [ { name: "Sri Lanka", value: 22000000 or null }, ... ]
function BarChart({ title, data, formatter }) {
  const show = formatter || formatNumber;

  // find the biggest value to scale the bars (ignore missing values)
  const values = data.filter((d) => d.value !== null).map((d) => d.value);
  const max = values.length > 0 ? Math.max(...values) : 0;

  return (
    <div className="chart-box">
      <h3>{title}</h3>
      {data.map((d) => {
        const width = d.value !== null && max > 0 ? (d.value / max) * 100 : 0;
        return (
          <div className="bar-row" key={d.name}>
            <span className="bar-name">{d.name}</span>
            <div className="bar-track">
              {d.value !== null && <div className="bar-fill" style={{ width: width + "%" }}></div>}
            </div>
            <span className="bar-value">{d.value !== null ? show(d.value) : "Unavailable"}</span>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
