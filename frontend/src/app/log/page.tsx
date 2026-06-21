'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, MuscleGroup, SubExercise, WorkoutLog, ExerciseLog } from '../api-client';
import Navbar from '../Navbar';

interface LogRow {
  localId: number;
  id?: number;
  muscleGroupId: string;
  subExerciseId: string;
  weight: string;
  reps: string;
  sets: string;
}

function LogWorkoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [rows, setRows] = useState<LogRow[]>([
    { localId: Date.now(), muscleGroupId: '', subExerciseId: '', weight: '', reps: '', sets: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const groups = await api.getMuscleGroups();
        setMuscleGroups(groups);

        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        setWorkoutName(`Workout - ${dateStr}`);

        if (draftId) {
          const draft = await api.getWorkout(draftId);
          setWorkoutName(draft.name);
          
          if (draft.exercises && draft.exercises.length > 0) {
            const mappedRows = draft.exercises.map((ex, idx) => {
              const subExId = ex.sub_exercise_id;
              let muscleGrpId = '';
              
              for (const g of groups) {
                if (g.exercises.some((e) => e.id === subExId)) {
                  muscleGrpId = g.id.toString();
                  break;
                }
              }

              return {
                localId: Date.now() + idx,
                id: ex.id,
                muscleGroupId: muscleGrpId,
                subExerciseId: subExId.toString(),
                weight: ex.weight.toString(),
                reps: ex.reps.toString(),
                sets: ex.sets.toString()
              };
            });
            setRows(mappedRows);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reference data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [draftId]);

  const handleAddRow = () => {
    setRows([
      ...rows,
      { localId: Date.now() + rows.length, muscleGroupId: '', subExerciseId: '', weight: '', reps: '', sets: '' }
    ]);
  };

  const handleRemoveRow = (localId: number) => {
    if (rows.length === 1) {
      setError('A workout must have at least one exercise row');
      return;
    }
    setRows(rows.filter((r) => r.localId !== localId));
  };

  const handleRowChange = (localId: number, field: keyof LogRow, value: string) => {
    setError('');
    setRows(
      rows.map((row) => {
        if (row.localId === localId) {
          const updated = { ...row, [field]: value };
          if (field === 'muscleGroupId') {
            updated.subExerciseId = '';
          }
          return updated;
        }
        return row;
      })
    );
  };

  const validateRows = (isDraft: boolean) => {
    if (rows.length === 0) {
      return 'Please add at least one exercise';
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const index = i + 1;
      
      if (!isDraft) {
        if (!r.muscleGroupId) return `Row ${index}: Please select a muscle group`;
        if (!r.subExerciseId) return `Row ${index}: Please select an exercise`;
        if (!r.sets || parseInt(r.sets) <= 0) return `Row ${index}: Sets must be greater than 0`;
        if (!r.reps || parseInt(r.reps) <= 0) return `Row ${index}: Reps must be greater than 0`;
        if (!r.weight || parseFloat(r.weight) < 0) return `Row ${index}: Weight cannot be negative`;
      } else {
        if (r.muscleGroupId && !r.subExerciseId) {
          return `Row ${index}: Please select an exercise or remove the row`;
        }
      }
    }
    return null;
  };

  const handleSave = async (isDraft: boolean) => {
    setError('');
    const validationErr = validateRows(isDraft);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSaving(true);

    try {
      const exercises: ExerciseLog[] = rows.map((r, idx) => {
        return {
          id: r.id,
          sub_exercise_id: parseInt(r.subExerciseId || '0'),
          weight: r.weight === '' ? '0.00' : parseFloat(r.weight).toFixed(2),
          reps: r.reps === '' ? 0 : parseInt(r.reps),
          sets: r.sets === '' ? 0 : parseInt(r.sets),
          order: idx
        };
      }).filter((ex) => !isDraft || ex.sub_exercise_id > 0);

      if (exercises.length === 0 && isDraft) {
        throw new Error('Please select at least one exercise to save as a draft.');
      }

      const workoutPayload: WorkoutLog = {
        name: workoutName.trim() || 'Workout Log',
        is_draft: isDraft,
        exercises
      };

      if (draftId) {
        await api.updateWorkout(draftId, workoutPayload);
      } else {
        await api.createWorkout(workoutPayload);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save workout log');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Loading log sheet...</p>
      </main>
    );
  }

  return (
    <main className="app-container animate-fade-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          {draftId ? 'Resume Workout Draft' : 'Log Workout Session'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Fill in the exercises, weights, and repetitions below.</p>
      </header>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <div className="form-group" style={{ marginBottom: '2.5rem', maxWidth: '400px' }}>
          <label className="form-label" htmlFor="workout-name">Workout Log Name</label>
          <input
            type="text"
            id="workout-name"
            className="form-input"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Heavy Push Day"
          />
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Exercises List
        </h3>

        <div id="exercise-rows-container">
          {rows.map((row, idx) => {
            const selectedGroupObj = muscleGroups.find((g) => g.id.toString() === row.muscleGroupId);
            const subExercisesForGroup = selectedGroupObj ? selectedGroupObj.exercises : [];

            return (
              <div key={row.localId} className="workout-log-grid exercise-block" id={`exercise-row-${idx}`}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Muscle Group</label>
                  <select
                    className="form-select"
                    value={row.muscleGroupId}
                    onChange={(e) => handleRowChange(row.localId, 'muscleGroupId', e.target.value)}
                    id={`select-muscle-group-${idx}`}
                  >
                    <option value="">Select muscle group...</option>
                    {muscleGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Exercise</label>
                  <select
                    className="form-select"
                    value={row.subExerciseId}
                    onChange={(e) => handleRowChange(row.localId, 'subExerciseId', e.target.value)}
                    disabled={!row.muscleGroupId}
                    id={`select-exercise-${idx}`}
                  >
                    <option value="">Select exercise...</option>
                    {subExercisesForGroup.map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Sets</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    min="1"
                    value={row.sets}
                    onChange={(e) => handleRowChange(row.localId, 'sets', e.target.value)}
                    id={`input-sets-${idx}`}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Reps</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    min="1"
                    value={row.reps}
                    onChange={(e) => handleRowChange(row.localId, 'reps', e.target.value)}
                    id={`input-reps-${idx}`}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Weight (kg)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="number"
                      step="0.25"
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      value={row.weight}
                      onChange={(e) => handleRowChange(row.localId, 'weight', e.target.value)}
                      id={`input-weight-${idx}`}
                      style={{ width: '100%' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.localId)}
                      className="btn btn-danger btn-sm"
                      id={`btn-remove-row-${idx}`}
                      style={{ height: '42px', padding: '0 0.85rem' }}
                      title="Remove exercise"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem', flexWrap: 'wrap', gap: '1.25rem' }}>
          <button
            type="button"
            onClick={handleAddRow}
            className="btn btn-secondary"
            id="btn-add-exercise"
          >
            ➕ Add Exercise
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="btn btn-outline"
              disabled={saving}
              id="btn-save-draft"
            >
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="btn btn-primary"
              disabled={saving}
              id="btn-save-workout"
            >
              {saving ? 'Saving...' : 'Complete Workout'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LogPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading interface...</p>
        </div>
      }>
        <LogWorkoutForm />
      </Suspense>
    </>
  );
}
