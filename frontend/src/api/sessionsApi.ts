export interface Session {
  id: number;
  hallName: string | null;
  title: string | null;
  lectorName: string | null;
  coLectorName: string | null;
  talkDescription: string | null;
  startTime: string;
  endTime: string;
}

export async function fetchSessions(hall?: string, day?: string): Promise<Session[]> {
  const params = new URLSearchParams();
  if (hall) params.set('hall', hall);
  if (day) params.set('day', day);
  const query = params.toString() ? `?${params}` : '';
  const res = await fetch(`/api/sessions${query}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function fetchHalls(): Promise<string[]> {
  const res = await fetch('/api/halls');
  if (!res.ok) throw new Error('Failed to fetch halls');
  return res.json();
}

export async function triggerImport(): Promise<void> {
  await fetch('/api/import', { method: 'POST' });
}
