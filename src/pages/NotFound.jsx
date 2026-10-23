import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="center-box">
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="btn primary">Go to dashboard</Link>
    </div>
  );
}

export default NotFound;
