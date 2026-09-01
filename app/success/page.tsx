import Link from "next/link";
import Header from "@/components/Header";

export default function SuccessPage() {
  return <main><Header/><section className="auth-shell"><div className="auth-card success-card"><span className="eyebrow">PAYMENT RECEIVED</span><h1>Welcome to TCF LEARN.</h1><p>Your $97 enrollment in <strong>Turning Forward: The Work Beyond Fear</strong> was completed. Stripe is securely confirming your access now.</p><p>Open your dashboard to begin. If access does not appear immediately, wait a few seconds and refresh—the webhook may still be processing.</p><Link className="button full" href="/dashboard">Go to user dashboard</Link></div></section></main>;
}
