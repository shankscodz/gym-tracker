'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, WorkoutLog, User } from '../api-client';
import Navbar from '../Navbar';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const profile = await api.getProfile();
        setUser(profile);
        
        const logs = await api.getWorkouts();
        setWorkouts(logs);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: number | undefined) => {
    if (!id || !confirm('Are you sure you want to delete this workout log?')) return;
    try {
      await api.deleteWorkout(id);
      setWorkouts(workouts.filter((w) => w.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete workout log');
    }
  };

  const getAnalytics = () => {
    const total = workouts.length;
    const drafts = workouts.filter((w) => w.is_draft).length;
    const completed = total - drafts;
    return { total, drafts, completed };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading dashboard...</p>
        </main>
      </>
    );
  }

  const { total, drafts, completed } = getAnalytics();

  return (
    <>
      <Navbar />
      <main className="app-container animate-fade-in">
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Welcome back, <span style={{ color: 'var(--color-primary)' }}>{user?.username}</span>
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Here is your fitness progress at a glance.</p>
          </div>
          <Link href="/log" className="btn btn-primary" id="btn-log-workout">
            + Log New Workout
          </Link>
        </header>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Analytics Section */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Total Logged</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</span>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Completed Sessions</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>{completed}</span>
          </div>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>Active Drafts</span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-warning)' }}>{drafts}</span>
          </div>
        </section>

        {/* Analytics Charts Section */}
        <AnalyticsCharts workouts={workouts} />

        {/* Workout History */}
        <section>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Workout History</h2>
          
          {workouts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                You haven't logged any workouts yet.
              </p>
              <Link href="/log" className="btn btn-primary" id="btn-dashboard-first-log">
                Log Your First Workout
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {workouts.map((workout) => (
                <div key={workout.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
                          {workout.name || 'Unnamed Workout'}
                        </h3>
                        {workout.is_draft ? (
                          <span className="badge badge-draft">Draft</span>
                        ) : (
                          <span className="badge badge-completed">Completed</span>
                        )}
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Logged on {new Date(workout.date || '').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {workout.is_draft && (
                        <button
                          onClick={() => router.push(`/log?draftId=${workout.id}`)}
                          className="btn btn-outline btn-sm"
                          id={`btn-resume-${workout.id}`}
                        >
                          Resume Draft
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="btn btn-danger btn-sm"
                        id={`btn-delete-${workout.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Exercises Details Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                          <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Exercise</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Muscle Group</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Sets</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Reps</th>
                          <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workout.exercises.map((ex, index) => (
                          <tr key={ex.id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{ex.sub_exercise_name}</td>
                            <td style={{ padding: '0.75rem 0.5rem' }}>
                              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {ex.muscle_group_name}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{ex.sets}</td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>{ex.reps}</td>
                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--color-primary)', fontWeight: 600 }}>{ex.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
