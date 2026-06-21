'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearTokens } from './api-client';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push('/login');
  };

  return (
    <nav className="navbar" id="main-nav">
      <Link href="/dashboard" className="nav-logo" id="nav-logo">
        🏋️‍♂️ FlexTracker
      </Link>
      <div className="nav-links" id="nav-links">
        <Link href="/dashboard" className="nav-link" id="nav-link-dashboard">
          Dashboard
        </Link>
        <Link href="/log" className="nav-link" id="nav-link-log">
          + Log Workout
        </Link>
        <a 
          href="http://localhost:8000/admin/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-link"
          id="nav-link-admin"
        >
          Admin Portal
        </a>
        <button 
          onClick={handleLogout} 
          className="btn btn-secondary btn-sm"
          id="btn-logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
