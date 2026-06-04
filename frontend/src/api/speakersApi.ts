import type {Session} from './sessionsApi';

export interface SpeakerDetail {
    id: number;
    name: string;
    imageUrl: string | null;
    bio: string | null;
    sessions: Session[];
}

export async function fetchSpeaker(id: number): Promise<SpeakerDetail> {
    const res = await fetch(`/api/speakers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch speaker');
    return res.json();
}
