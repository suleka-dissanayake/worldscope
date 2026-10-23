function Loader({ text }) {
  return (
    <div className="center-box" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p>{text || "Loading..."}</p>
    </div>
  );
}

export default Loader;
