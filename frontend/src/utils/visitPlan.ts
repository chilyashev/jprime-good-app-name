const KEY = 'jprime_plan_sessions';

function load(): Set<number> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function persist(ids: Set<number>): void {
  localStorage.setItem(KEY, JSON.stringify([...ids]));
}

export function isInPlan(id: number): boolean {
  return load().has(id);
}

export function addToPlan(id: number): void {
  const ids = load();
  ids.add(id);
  persist(ids);
}

export function removeFromPlan(id: number): void {
  const ids = load();
  ids.delete(id);
  persist(ids);
}

export function getPlanIds(): number[] {
  return [...load()];
}

export function getPlanCount(): number {
  return load().size;
}
