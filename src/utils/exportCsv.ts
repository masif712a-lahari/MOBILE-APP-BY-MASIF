import { TimerSession } from '../types';

export function formatDurationText(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportSessionsToCsv(sessions: TimerSession[]) {
  if (!sessions || sessions.length === 0) {
    alert('No sessions to export yet! Complete a countdown timer session first.');
    return;
  }

  const headers = [
    'Session ID',
    'Date',
    'Time (Local)',
    'Session Title',
    'Category',
    'Target Duration (Seconds)',
    'Elapsed Duration (Seconds)',
    'Target Formatted',
    'Elapsed Formatted',
    'Completion Status',
    'Completion Rate (%)',
    'Completed At',
    'Device Origin',
    'Notes'
  ];

  const rows = sessions.map(s => {
    const createdDate = new Date(s.createdAt);
    const dateFormatted = createdDate.toLocaleDateString();
    const timeFormatted = createdDate.toLocaleTimeString();
    const status = s.completed ? 'Completed' : 'Cancelled / Incomplete';
    const rate = s.targetSeconds > 0 ? Math.min(100, Math.round((s.elapsedSeconds / s.targetSeconds) * 100)) : 100;
    const completedAtStr = s.completedAt ? new Date(s.completedAt).toLocaleString() : '';

    return [
      escapeCsvField(s.id),
      escapeCsvField(dateFormatted),
      escapeCsvField(timeFormatted),
      escapeCsvField(s.title || 'Timer Session'),
      escapeCsvField(s.category || 'Focus'),
      escapeCsvField(s.targetSeconds),
      escapeCsvField(s.elapsedSeconds),
      escapeCsvField(formatDurationText(s.targetSeconds)),
      escapeCsvField(formatDurationText(s.elapsedSeconds)),
      escapeCsvField(status),
      escapeCsvField(rate),
      escapeCsvField(completedAtStr),
      escapeCsvField(s.deviceId || 'Android Device'),
      escapeCsvField(s.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];

  a.href = url;
  a.setAttribute('download', `chronos_timer_sessions_${todayStr}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSessionsToJson(sessions: TimerSession[]) {
  const jsonStr = JSON.stringify(sessions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];

  a.href = url;
  a.setAttribute('download', `chronos_backup_${todayStr}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
