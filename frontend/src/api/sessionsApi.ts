export interface Speaker {
  id: number;
  name: string;
}

export interface Session {
  id: number;
  hallName: string | null;
  title: string | null;
  lectorName: string | null;
  coLectorName: string | null;
  talkDescription: string | null;
  startTime: string;
  endTime: string;
  speakers: Speaker[];
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

let hallsPromise: Promise<string[]> | null = null;

export function fetchHalls(): Promise<string[]> {
    if (!hallsPromise) {
        hallsPromise = fetch('/api/halls').then(res => {
            if (!res.ok) {
                hallsPromise = null;
                throw new Error('Failed to fetch halls');
            }
            return res.json();
        });
    }
    return hallsPromise;
}

export async function triggerImport(): Promise<void> {
  await fetch('/api/import', { method: 'POST' });
}
