import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Tooltip from '@mui/material/Tooltip';
import {useMediaQuery, useTheme} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SessionCard from '../components/SessionCard';
import {fetchSessions, type Session, triggerImport} from '../api/sessionsApi';

const HALLS = ['hall A', 'hall B', 'workshops'];

// ─── Time grid constants ─────────────────────────────────────────────────────
const MINUTES_PER_ROW = 5;
const ROW_HEIGHT = 8; // px — minimum height per 5-minute slot; rows grow to fit content

// ─── Utilities ───────────────────────────────────────────────────────────────

function localNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function extractDays(sessions: Session[]): string[] {
  const days = new Set(sessions.map(s => s.startTime.slice(0, 10)));
  return [...days].sort();
}

function dtToMinutes(dt: string): number {
  const [h, m] = dt.slice(11, 16).split(':').map(Number);
  return h * 60 + m;
}

function sessionsOverlap(a: Session, b: Session): boolean {
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

// ─── Grid layout builder ─────────────────────────────────────────────────────

interface GridItem {
  session: Session;
  colStart: number; // 1-indexed CSS grid column
  colEnd: number;   // exclusive
  rowStart: number; // 1-indexed (row 1 = header row)
  rowEnd: number;
}

function buildGridItems(filtered: Record<string, Session[]>, dayStartMin: number): GridItem[] {
  const items: GridItem[] = [];

  function toRow(dt: string): number {
    return Math.round((dtToMinutes(dt) - dayStartMin) / MINUTES_PER_ROW) + 2; // +2: row 1 is the header
  }

  // Hall-specific sessions — one column each
  HALLS.forEach((hall, i) => {
    (filtered[hall] ?? [])
        .filter(s => s.hallName === hall)
        .forEach(s => {
          items.push({
            session: s,
            colStart: i + 1,
            colEnd: i + 2,
            rowStart: toRow(s.startTime),
            rowEnd: toRow(s.endTime)
          });
        });
  });

  // Shared sessions (hallName=null) — deduplicate by id, then span only columns
  // that don't already have a conflicting regular session at the same time.
  const seen = new Set<number>();
  const shared: Session[] = [];
  HALLS.forEach(h => {
    (filtered[h] ?? []).filter(s => s.hallName === null).forEach(s => {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        shared.push(s);
      }
    });
  });

  shared.forEach(s => {
    // Which hall indices have a regular session that overlaps this shared one?
    const conflict = new Set(
        HALLS.map((hall, i) => {
          const regular = (filtered[hall] ?? []).filter(r => r.hallName === hall);
          return regular.some(r => sessionsOverlap(r, s)) ? i : -1;
        }).filter(i => i >= 0),
    );

    // Walk the hall list and emit one grid item per consecutive run of free columns.
    let spanStart: number | null = null;
    for (let i = 0; i <= HALLS.length; i++) {
      const free = i < HALLS.length && !conflict.has(i);
      if (free && spanStart === null) {
        spanStart = i;
      } else if (!free && spanStart !== null) {
        items.push({
          session: s,
          colStart: spanStart + 1,
          colEnd: i + 1,
          rowStart: toRow(s.startTime),
          rowEnd: toRow(s.endTime)
        });
        spanStart = null;
      }
    }
  });

  return items;
}

// ─── Desktop grid ────────────────────────────────────────────────────────────

interface DesktopScheduleGridProps {
  selectedDay: string;
  now: string;
  onDaysLoaded: (days: string[]) => void;
  onPlanChange: () => void;
  onSpeakerClick: (speakerId: number) => void;
}

function DesktopScheduleGrid({selectedDay, now, onDaysLoaded, onPlanChange, onSpeakerClick}: DesktopScheduleGridProps) {
  const [hallData, setHallData] = useState<Record<string, Session[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError(false);
    try {
      const results = await Promise.allSettled(HALLS.map(h => fetchSessions(h)));
      const map: Record<string, Session[]> = {};
      results.forEach((r, i) => {
        map[HALLS[i]] = r.status === 'fulfilled' ? r.value : [];
      });
      setHallData(map);
      onDaysLoaded(extractDays(Object.values(map).flat()));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRetry() {
    try {
      await triggerImport();
    } catch { /* ignore */
    }
    loadAll();
  }

  // Filter each hall by selected day
  const filtered: Record<string, Session[]> = {};
  for (const hall of HALLS) {
    const all = hallData[hall] ?? [];
    filtered[hall] = selectedDay ? all.filter(s => s.startTime.startsWith(selectedDay)) : all;
  }

  const allFiltered = HALLS.flatMap(h => filtered[h]);

  if (loading) {
    return <Box sx={{display: 'flex', justifyContent: 'center', pt: 6}}><CircularProgress/></Box>;
  }

  if (error) {
    return (
        <Box sx={{textAlign: 'center', pt: 6}}>
          <CalendarTodayIcon sx={{fontSize: 48, color: 'primary.main', mb: 2}}/>
          <Typography variant="body1" sx={{mb: 2}}>Sessions loading… tap Retry if this takes too long</Typography>
          <Button variant="outlined" onClick={handleRetry}>Retry</Button>
        </Box>
    );
  }

  if (allFiltered.length === 0) {
    return (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          borderTop: 1,
          borderLeft: 1,
          borderColor: 'divider'
        }}>
          {HALLS.map((hall, i) => (
              <Typography key={hall} variant="subtitle1" sx={{
                px: 2, py: 1.5, fontWeight: 700, borderBottom: 1, borderRight: 1, borderColor: 'divider',
                bgcolor: 'background.paper', position: 'sticky', top: '64px', zIndex: 9, textAlign: 'center',
              }}>
                {hall.replace(/^\w/, c => c.toUpperCase())}
              </Typography>
          ))}
          {HALLS.map(hall => (
              <Box key={hall} sx={{textAlign: 'center', pt: 4, borderRight: 1, borderColor: 'divider'}}>
                <Typography variant="body2" color="text.secondary">No sessions for this day</Typography>
              </Box>
          ))}
        </Box>
    );
  }

  const dayStartMin = Math.min(...allFiltered.map(s => dtToMinutes(s.startTime)));

  const gridItems = buildGridItems(filtered, dayStartMin);

  return (
      <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            // Row 1 = sticky column headers (explicit, auto height).
            // Rows 2+ = implicit time-slot rows: each is at least ROW_HEIGHT px but
            // expands to fit card content so descriptions are never clipped.
            gridTemplateRows: 'auto',
            gridAutoRows: `minmax(${ROW_HEIGHT}px, auto)`,
            borderTop: 1,
            borderLeft: 1,
            borderColor: 'divider',
          }}
      >
        {/* Sticky column headers — row 1 */}
        {HALLS.map((hall, i) => (
            <Typography
                key={hall}
                variant="subtitle1"
                sx={{
                  gridRow: 1,
                  gridColumn: i + 1,
                  px: 2, py: 1.5,
                  fontWeight: 700,
                  borderBottom: 1,
                  borderRight: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  top: '64px',
                  zIndex: 9,
                  textAlign: 'center',
                }}
            >
              {hall.replace(/^\w/, c => c.toUpperCase())}
            </Typography>
        ))}

        {/* Session items — placed by explicit gridRow / gridColumn */}
        {gridItems.map(({session, colStart, colEnd, rowStart, rowEnd}) => {
          const isCurrent = session.startTime.slice(0, 19) <= now && session.endTime.slice(0, 19) > now;
          // Show right border only if the item doesn't reach the last column
          const hasRightBorder = colEnd <= HALLS.length;
          return (
              <Box
                  key={`${session.id}-${colStart}`}
                  sx={{
                    gridColumn: `${colStart} / ${colEnd}`,
                    gridRow: `${rowStart} / ${rowEnd}`,
                    p: 0.5,
                    borderRight: hasRightBorder ? 1 : 0,
                    borderColor: 'divider',
                  }}
              >
                <SessionCard
                    session={session}
                    isCurrent={isCurrent}
                    onPlanChange={onPlanChange}
                    onSpeakerClick={onSpeakerClick}
                />
              </Box>
          );
        })}
      </Box>
  );
}

// ─── AgendaPage ──────────────────────────────────────────────────────────────

interface Props {
  selectedDay: string;
  onDaysLoaded: (days: string[]) => void;
  onPlanChange: () => void;
  onSpeakerClick: (speakerId: number) => void;
}

export default function AgendaPage({selectedDay, onDaysLoaded, onPlanChange, onSpeakerClick}: Props) {
  const [selectedHall, setSelectedHall] = useState(0);
  const [tabsStuck, setTabsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => localNow());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentCardRef = useRef<HTMLDivElement>(null);
  const [currentCardVisible, setCurrentCardVisible] = useState(true);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(localNow()), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
        ([entry]) => setTabsStuck(!entry.isIntersecting), {threshold: 0},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function loadSessions(hall: string) {
    setLoading(true);
    setError(false);
    try {
      const data = await fetchSessions(hall);
      setSessions(data);
      onDaysLoaded(extractDays(data));
    } catch {
      setError(true);
      setSessions([]);
      onDaysLoaded([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isDesktop) loadSessions(HALLS[selectedHall]);
  }, [selectedHall, isDesktop]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleRetry() {
    try {
      await triggerImport();
    } catch { /* ignore */
    }
    loadSessions(HALLS[selectedHall]);
  }

  const visibleSessions = selectedDay
    ? sessions.filter(s => s.startTime.startsWith(selectedDay))
    : sessions;

  const currentSession = visibleSessions.find(
      s => s.startTime.slice(0, 19) <= now && s.endTime.slice(0, 19) > now,
  );

  useEffect(() => {
    setCurrentCardVisible(true);
    const el = currentCardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
        ([entry]) => setCurrentCardVisible(entry.isIntersecting), {threshold: 0.1},
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentSession?.id]);

  function scrollToCurrent() {
    currentCardRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  if (isDesktop) {
    return (
        <DesktopScheduleGrid
            selectedDay={selectedDay}
            now={now}
            onDaysLoaded={onDaysLoaded}
            onPlanChange={onPlanChange}
            onSpeakerClick={onSpeakerClick}
        />
    );
  }

  return (
      <Box sx={{mt: 2}}>
        <Box ref={sentinelRef} sx={{height: 0}}/>

      <Tabs
        value={selectedHall}
        onChange={(_, v) => setSelectedHall(v)}
        variant="fullWidth"
        sx={{
          borderBottom: 1, borderColor: 'divider',
          position: 'sticky', top: 0, zIndex: 10,
          bgcolor: 'background.paper',
          '& .MuiTab-root': {fontSize: tabsStuck ? '0.72rem' : undefined},
        }}
      >
        {HALLS.map((h, i) => (
          <Tab key={h} label={h.replace(/^\w/, c => c.toUpperCase())} id={`hall-tab-${i}`} />
        ))}
      </Tabs>

        {loading && <Box sx={{display: 'flex', justifyContent: 'center', pt: 6}}><CircularProgress/></Box>}

      {!loading && error && (
        <Box sx={{ textAlign: 'center', pt: 6 }}>
          <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" sx={{mb: 2}}>Sessions loading… tap Retry if this takes too long</Typography>
          <Button variant="outlined" onClick={handleRetry}>Retry</Button>
        </Box>
      )}

      {!loading && !error && (
        <Box sx={{ px: 2, py: 1 }}>
          {visibleSessions.length === 0 && (
            <Box sx={{ textAlign: 'center', pt: 6 }}>
              <CalendarTodayIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" sx={{mb: 2}}>No sessions available for this selection</Typography>
              <Button variant="outlined" onClick={handleRetry}>Retry</Button>
            </Box>
          )}
          {visibleSessions.map(s => {
            const isCurrent = s.startTime.slice(0, 19) <= now && s.endTime.slice(0, 19) > now;
            return isCurrent ? (
                <div key={s.id} ref={currentCardRef}>
                  <SessionCard session={s} isCurrent onPlanChange={onPlanChange} onSpeakerClick={onSpeakerClick}/>
                </div>
            ) : (
                <SessionCard key={s.id} session={s} isCurrent={false} onPlanChange={onPlanChange}
                             onSpeakerClick={onSpeakerClick}/>
            );
          })}
        </Box>
      )}

      {currentSession && !currentCardVisible && (
          <Tooltip title="Jump to current talk" placement="left">
            <Fab
                color="primary" size="small" onClick={scrollToCurrent}
                aria-label="Jump to current talk"
                sx={{position: 'fixed', bottom: {xs: 72, md: 24}, right: 16, zIndex: 1200}}
            >
              <PlayArrowIcon/>
            </Fab>
          </Tooltip>
      )}
    </Box>
  );
}
