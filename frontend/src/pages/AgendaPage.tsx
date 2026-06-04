import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SessionCard from '../components/SessionCard';
import { fetchSessions, triggerImport, type Session } from '../api/sessionsApi';

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function extractDays(sessions: Session[]): string[] {
  const days = new Set(sessions.map(s => s.startTime.slice(0, 10)));
  return [...days].sort();
}

interface Props {
  onPlanChange: () => void;
}

export default function AgendaPage({ onPlanChange }: Props) {
  const halls = ['hall A', 'hall B', 'workshops'];
  const [selectedHall, setSelectedHall] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  function pickDay(available: string[], prev: string): string {
    if (prev && available.includes(prev)) return prev;
    return available.includes(today) ? today : (available[0] ?? '');
  }

  async function loadSessions(hall: string) {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchSessions(hall);
      setSessions(data);
      const d = extractDays(data);
      setDays(d);
      setSelectedDay(prev => pickDay(d, prev));
    } catch {
      setError(true);
      setSessions([]);
      setDays([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions(halls[selectedHall]);
  }, [selectedHall]);

  async function handleRetry() {
    try {
      await triggerImport();
    } catch { /* ignore */ }
    loadSessions(halls[selectedHall]);
  }

  const visibleSessions = selectedDay
    ? sessions.filter(s => s.startTime.startsWith(selectedDay))
    : sessions;

  return (
    <Box>
      {/* Day selector */}
      <Stack direction="row" spacing={1} sx={{ px: 2, py: 1, overflowX: 'auto', flexWrap: 'nowrap' }}>
        {days.map(day => (
          <Chip
            key={day}
            label={formatDayLabel(day)}
            color={selectedDay === day ? 'primary' : 'default'}
            onClick={() => setSelectedDay(day)}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Stack>

      {/* Hall tabs */}
      <Tabs
        value={selectedHall}
        onChange={(_, v) => setSelectedHall(v)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {halls.map((h, i) => (
          <Tab key={h} label={h.replace(/^\w/, c => c.toUpperCase())} id={`hall-tab-${i}`} />
        ))}
      </Tabs>

      {/* Content */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Box sx={{ textAlign: 'center', pt: 6 }}>
          <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sessions loading… tap Retry if this takes too long
          </Typography>
          <Button variant="outlined" onClick={handleRetry}>Retry</Button>
        </Box>
      )}

      {!loading && !error && (
        <Box sx={{ px: 2, py: 1 }}>
          {visibleSessions.length === 0 && (
            <Box sx={{ textAlign: 'center', pt: 6 }}>
              <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" sx={{ mb: 2 }}>
                No sessions available for this selection
              </Typography>
              <Button variant="outlined" onClick={handleRetry}>Retry</Button>
            </Box>
          )}
          {visibleSessions.map(s => (
            <SessionCard key={s.id} session={s} onPlanChange={onPlanChange} />
          ))}
        </Box>
      )}
    </Box>
  );
}
