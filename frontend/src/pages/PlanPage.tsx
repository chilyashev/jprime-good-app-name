import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SessionCard from '../components/SessionCard';
import {fetchSessions, type Session} from '../api/sessionsApi';
import {getPlanIds} from '../utils/visitPlan';

interface Props {
  onGoToAgenda: () => void;
  planCount: number;
  onPlanChange?: () => void;
  onSpeakerClick?: (speakerId: number) => void;
}

function isHappeningNow(session: Session, now: Date): boolean {
  return new Date(session.startTime) <= now && now < new Date(session.endTime);
}

export default function PlanPage({onGoToAgenda, planCount, onPlanChange, onSpeakerClick}: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  async function loadPlan() {
    const ids = getPlanIds();
    if (ids.length === 0) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const all = await fetchSessions();
      setSessions(all.filter(s => ids.includes(s.id)));
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadPlan();
  }, [planCount]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
        <Typography variant="body2" color="text.secondary">Loading…</Typography>
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', pt: 6, px: 2 }}>
        <EventNoteIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="body1" sx={{ mb: 2 }}>
          Your schedule is empty. Browse the Agenda and add sessions.
        </Typography>
        <Button variant="contained" onClick={onGoToAgenda}>Go to Agenda</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
      </Typography>
      {sessions.map(s => (
          <SessionCard key={s.id} session={s} isCurrent={isHappeningNow(s, now)} onPlanChange={() => {
            loadPlan();
            onPlanChange?.();
          }} onSpeakerClick={onSpeakerClick}/>
      ))}
    </Box>
  );
}
