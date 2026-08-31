export default function ProgressBar({ value }: { value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return <div className="progress" aria-label={`${safe}% complete`}><span style={{ width: `${safe}%` }} /></div>;
}
