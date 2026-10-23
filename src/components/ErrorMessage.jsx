function ErrorMessage({ message, onRetry }) {
  return (
    <div className="center-box error-box" role="alert">
      <p>{message}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
