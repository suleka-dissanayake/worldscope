import { useState } from "react";

function Settings({ countries, settings, onSave, onReset }) {
  // controlled form: every input value lives in state
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const regions = [];
  for (const c of countries) {
    if (c.region && !regions.includes(c.region)) regions.push(c.region);
  }
  regions.sort();

  const sortedCountries = [...countries].sort((a, b) => a.name.common.localeCompare(b.name.common));

  // one handler for all inputs: it uses the input's "name" attribute
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  }

  function validate() {
    const newErrors = {};
    const name = form.name.trim();

    if (name === "") newErrors.name = "Profile name is required.";
    else if (name.length < 3 || name.length > 30) newErrors.name = "Profile name must be 3 to 30 characters.";

    if (form.region === "") newErrors.region = "Please choose a preferred region.";
    if (form.country === "") newErrors.country = "Please choose a preferred country.";
    if (form.sort === "") newErrors.sort = "Please choose a default sort order.";

    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave({ ...form, name: form.name.trim() });
      setSaved(true);
    }
  }

  function handleReset() {
    const sure = window.confirm("Reset all settings to their defaults?");
    if (sure) {
      onReset();
      setForm({ name: "", region: "", country: "", sort: "name" });
      setErrors({});
      setSaved(false);
    }
  }

  return (
    <div>
      <h1>Settings</h1>
      <p className="muted">Your preferences are saved in this browser.</p>

      <form className="panel form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="name">Profile name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            aria-invalid={errors.name ? "true" : "false"}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <span className="error-text" id="name-error">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="region">Preferred region</label>
          <select id="region" name="region" value={form.region} onChange={handleChange}>
            <option value="">Choose a region...</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.region && <span className="error-text">{errors.region}</span>}
        </div>

        <div className="field">
          <label htmlFor="country">Preferred country</label>
          <select id="country" name="country" value={form.country} onChange={handleChange}>
            <option value="">Choose a country...</option>
            {sortedCountries.map((c) => (
              <option key={c.cca3} value={c.cca3}>{c.name.common}</option>
            ))}
          </select>
          {errors.country && <span className="error-text">{errors.country}</span>}
        </div>

        <div className="field">
          <label htmlFor="sort">Default sort order</label>
          <select id="sort" name="sort" value={form.sort} onChange={handleChange}>
            <option value="name">Name (A–Z)</option>
            <option value="population">Population (high to low)</option>
            <option value="area">Area (large to small)</option>
          </select>
          {errors.sort && <span className="error-text">{errors.sort}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn primary">Save settings</button>
          <button type="button" className="btn" onClick={handleReset}>Reset settings</button>
        </div>

        {saved && <p className="success-text" role="status">Settings saved.</p>}
      </form>
    </div>
  );
}

export default Settings;
