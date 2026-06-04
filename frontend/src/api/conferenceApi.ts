export interface ConferenceSettings {
    id: number;
    name: string;
    year: number;
    logoUrl: string | null;
}

export async function fetchConferenceSettings(): Promise<ConferenceSettings> {
    const res = await fetch('/api/conference/current');
    if (!res.ok) throw new Error('Failed to fetch conference settings');
    return res.json();
}
