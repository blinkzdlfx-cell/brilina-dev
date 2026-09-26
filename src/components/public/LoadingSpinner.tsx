import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-label="Loading">
      <div className="loading-spinner__spinner" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
