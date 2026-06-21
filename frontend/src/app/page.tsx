import Link from 'next/link';

export default function Home() {
  return (
    <main className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div className="card animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
          🏋️‍♂️ FlexTracker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          The ultimate gym tracker for serious athletes. Log sets, reps, and weights dynamically, save drafts, and manage your exercises in real-time.
        </p>
        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn btn-primary" id="btn-landing-login" style={{ minWidth: '130px' }}>
            Login
          </Link>
          <Link href="/register" className="btn btn-secondary" id="btn-landing-register" style={{ minWidth: '130px' }}>
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
