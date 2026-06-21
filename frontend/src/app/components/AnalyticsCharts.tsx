'use client';

import { useState } from 'react';
import { WorkoutLog } from '../api-client';

interface AnalyticsChartsProps {
  workouts: WorkoutLog[];
}

export default function AnalyticsCharts({ workouts }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'volume' | 'frequency' | 'muscle'>('volume');

  // Sample data to show if the user has no history
  const sampleVolumeData = [
    { label: 'Week 1', value: 2400 },
    { label: 'Week 2', value: 3100 },
    { label: 'Week 3', value: 2900 },
    { label: 'Week 4', value: 4200 },
    { label: 'Week 5', value: 4800 },
    { label: 'Week 6', value: 5600 },
  ];

  const sampleFrequencyData = [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 2 },
    { label: 'Thu', value: 1 },
    { label: 'Fri', value: 3 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 1 },
  ];

  const sampleMuscleData = [
    { name: 'Legs', percentage: 35, color: '#10b981' },
    { name: 'Glutes', percentage: 20, color: '#0ea5e9' },
    { name: 'Chest', percentage: 15, color: '#f43f5e' },
    { name: 'Shoulders', percentage: 12, color: '#f59e0b' },
    { name: 'Arms/Core', percentage: 18, color: '#8b5cf6' },
  ];

  // Process real data
  const hasWorkouts = workouts && workouts.length > 0;
  
  // 1. Process Volume Data (weight * reps * sets)
  const getVolumeData = () => {
    if (!hasWorkouts) return sampleVolumeData;
    
    // Sort workouts oldest to newest
    const sorted = [...workouts]
      .filter(w => !w.is_draft)
      .reverse();
      
    if (sorted.length === 0) return sampleVolumeData;

    return sorted.map((w, idx) => {
      const volume = w.exercises.reduce((sum, ex) => {
        const wt = typeof ex.weight === 'string' ? parseFloat(ex.weight) : ex.weight;
        return sum + (wt * ex.reps * ex.sets);
      }, 0);
      
      const date = new Date(w.date || '');
      const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      return {
        label: w.name || label || `Wk ${idx + 1}`,
        value: volume
      };
    });
  };

  // 2. Process Frequency Data (workouts per weekday)
  const getFrequencyData = () => {
    if (!hasWorkouts) return sampleFrequencyData;

    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun to Sat
    workouts.filter(w => !w.is_draft).forEach(w => {
      const day = new Date(w.date || '').getDay();
      weekdayCounts[day]++;
    });

    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return labels.map((label, idx) => ({
      label,
      value: weekdayCounts[idx]
    }));
  };

  // 3. Process Muscle Group focus distribution
  const getMuscleData = () => {
    if (!hasWorkouts) return sampleMuscleData;

    const counts: { [key: string]: number } = {};
    let totalExercises = 0;

    workouts.filter(w => !w.is_draft).forEach(w => {
      w.exercises.forEach(ex => {
        const group = ex.muscle_group_name || 'Other';
        counts[group] = (counts[group] || 0) + ex.sets;
        totalExercises += ex.sets;
      });
    });

    if (totalExercises === 0) return sampleMuscleData;

    const colors = ['#10b981', '#0ea5e9', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];
    return Object.keys(counts).map((key, idx) => ({
      name: key,
      percentage: Math.round((counts[key] / totalExercises) * 100),
      color: colors[idx % colors.length]
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const volumeData = getVolumeData();
  const freqData = getFrequencyData();
  const muscleData = getMuscleData();

  // SVG parameters
  const width = 500;
  const height = 220;
  const padding = 40;

  // Render SVG Line Chart for Volume
  const renderVolumeLineChart = () => {
    const values = volumeData.map((d) => d.value);
    const maxVal = Math.max(...values, 1000);
    const minVal = Math.min(...values, 0);
    const range = maxVal - minVal;

    const points = volumeData.map((d, idx) => {
      const x = padding + (idx * (width - padding * 2)) / Math.max(volumeData.length - 1, 1);
      const y = height - padding - ((d.value - minVal) * (height - padding * 2)) / range;
      return { x, y, ...d };
    });

    const pathData = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Gradient fill path data
    const fillPathData = pathData 
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
      : '';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="fill-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding + r * (height - padding * 2);
          const gridVal = Math.round(maxVal - r * range);
          return (
            <g key={i} opacity="0.3">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              <text x={padding - 8} y={y + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end">{gridVal} kg</text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        {fillPathData && <path d={fillPathData} fill="url(#fill-gradient)" />}

        {/* Glowing Path Line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'drop-shadow(0px 4px 8px var(--color-primary-glow))'
            }}
          />
        )}

        {/* Data points (dots) */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-dot-group" style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-primary)" stroke="var(--color-primary)" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="10" fill="var(--color-primary)" opacity="0" className="interactive-ring" />
            <title>{`${p.label}: ${p.value.toLocaleString()} kg total volume`}</title>
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => {
          // Skip drawing some labels if too many to prevent cluttering
          if (points.length > 6 && idx % 2 !== 0) return null;
          return (
            <text key={idx} x={p.x} y={height - 12} fill="var(--text-muted)" fontSize="9.5" textAnchor="middle" fontWeight="500">
              {p.label.length > 8 ? p.label.substring(0, 7) + '..' : p.label}
            </text>
          );
        })}
      </svg>
    );
  };

  // Render SVG Bar Chart for Frequency
  const renderFrequencyBarChart = () => {
    const maxVal = Math.max(...freqData.map((d) => d.value), 4);
    const chartHeight = height - padding * 2;
    const barWidth = 30;
    const spacing = (width - padding * 2) / freqData.length;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-secondary)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0.2)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((gridVal, i) => {
          const ratio = gridVal / 4;
          const y = height - padding - ratio * chartHeight;
          return (
            <g key={i} opacity="0.3">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.1)" />
              <text x={padding - 8} y={y + 4} fill="var(--text-muted)" fontSize="9.5" textAnchor="end">
                {Math.round(ratio * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {freqData.map((d, idx) => {
          const x = padding + idx * spacing + (spacing - barWidth) / 2;
          const barHeight = (d.value / maxVal) * chartHeight;
          const y = height - padding - barHeight;

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="6"
                fill="url(#bar-gradient)"
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <title>{`${d.label}: ${d.value} workouts`}</title>
              </rect>
              {/* Text value on top of bar */}
              {d.value > 0 && (
                <text x={x + barWidth / 2} y={y - 6} fill="var(--color-secondary)" fontSize="9" fontWeight="700" textAnchor="middle">
                  {d.value}
                </text>
              )}
              {/* X Axis labels */}
              <text x={x + barWidth / 2} y={height - 12} fill="var(--text-muted)" fontSize="10" textAnchor="middle">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Analytics & Metrics</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {!hasWorkouts && '💡 Displaying sample workout data to showcase analytics.'}
            {hasWorkouts && '⚡ Real-time statistics from your training history.'}
          </p>
        </div>

        {/* Tabs switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('volume')}
            className={`btn btn-sm ${activeTab === 'volume' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            id="tab-volume"
          >
            Volume (kg)
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`btn btn-sm ${activeTab === 'frequency' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            id="tab-frequency"
          >
            Consistency
          </button>
          <button
            onClick={() => setActiveTab('muscle')}
            className={`btn btn-sm ${activeTab === 'muscle' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            id="tab-muscle"
          >
            Muscle Split
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '240px', justifyContent: 'center' }}>
        {activeTab === 'volume' && (
          <div className="animate-fade-in" style={{ width: '100%', height: '220px' }}>
            {renderVolumeLineChart()}
          </div>
        )}

        {activeTab === 'frequency' && (
          <div className="animate-fade-in" style={{ width: '100%', height: '220px' }}>
            {renderFrequencyBarChart()}
          </div>
        )}

        {activeTab === 'muscle' && (
          <div className="animate-fade-in" style={{ padding: '0.5rem 0' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Muscle Group Training Focus
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {muscleData.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span>{d.name}</span>
                    <span style={{ color: d.color }}>{d.percentage}%</span>
                  </div>
                  {/* Glowing custom progress bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${d.percentage}%`,
                        height: '100%',
                        backgroundColor: d.color,
                        borderRadius: '9999px',
                        boxShadow: `0 0 8px ${d.color}cc`,
                        transition: 'width 1s ease-out'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
