import {useState} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type {Session} from '../api/sessionsApi';
import {addToPlan, isInPlan, removeFromPlan} from '../utils/visitPlan';

function formatTime(dt: string): string {
  return dt.slice(11, 16);
}

const TRUNCATE_AT = 256;

interface Props {
  session: Session;
  isCurrent?: boolean;
  showHall?: boolean;
  onPlanChange?: () => void;
  onSpeakerClick?: (speakerId: number) => void;
}

export default function SessionCard({session, isCurrent, showHall, onPlanChange, onSpeakerClick}: Props) {
  const [saved, setSaved] = useState(() => isInPlan(session.id));
  const [expanded, setExpanded] = useState(false);

  function toggle() {
    if (saved) {
      removeFromPlan(session.id);
    } else {
      addToPlan(session.id);
    }
    setSaved(!saved);
    onPlanChange?.();
  }

  const timeLabel = `${formatTime(session.startTime)}–${formatTime(session.endTime)}`;

  const speakers = session.speakers ?? [];
  const hasSpeakers = speakers.length > 0;
  const fallbackSpeakers = !hasSpeakers
      ? [session.lectorName, session.coLectorName].filter(Boolean).join(', ')
      : '';

  const desc = session.talkDescription;
  const isLong = !!desc && desc.length > TRUNCATE_AT;

  return (
      <Card sx={{
        mb: 1,
        ...(isCurrent && {
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          bgcolor: 'rgba(98,0,234,0.12)',
        }),
      }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{flex: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              <Typography variant="h6" component="div" sx={{fontWeight: 700}}>
                {session.title ?? '(Untitled)'}
              </Typography>
              {isCurrent && <Chip label="NOW" color="primary" size="small"/>}
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25}}>
              <AccessTimeIcon sx={{fontSize: 14, color: isCurrent ? 'primary.main' : 'text.secondary'}}/>
              <Typography variant="caption" color={isCurrent ? 'primary.main' : 'text.secondary'}>
                {timeLabel}
              </Typography>
            </Box>
            {showHall && session.hallName && (
                <Typography variant="caption" color="text.secondary">
                  {session.hallName}
                </Typography>
            )}
          </Box>
        </Box>

        {hasSpeakers && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {speakers.map((sp, i) => (
                <span key={sp.id}>
                {i > 0 && ', '}
                  {onSpeakerClick ? (
                      <Link
                          component="button"
                          variant="body2"
                          onClick={() => onSpeakerClick(sp.id)}
                          sx={{verticalAlign: 'baseline'}}
                      >
                        {sp.name}
                      </Link>
                  ) : (
                      sp.name
                  )}
              </span>
            ))}
          </Typography>
        )}

        {!hasSpeakers && fallbackSpeakers && (
            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
              {fallbackSpeakers}
          </Typography>
        )}

        {desc && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
              {isLong && !expanded ? desc.slice(0, TRUNCATE_AT) + '…' : desc}
            </Typography>
            {isLong && (
                <Link
                    component="button"
                    variant="caption"
                    onClick={() => setExpanded(e => !e)}
                    sx={{display: 'block', textAlign: 'left', mt: 0.25}}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </Link>
            )}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Tooltip title={saved ? 'Remove from schedule' : 'Add to my schedule'}>
            <Box
                component="button"
              onClick={toggle}
                aria-label={saved ? 'Remove session from schedule' : 'Add session to my schedule'}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  background: 'none', border: 'none', cursor: 'pointer', p: 0.5, borderRadius: 1,
                  color: saved ? 'success.main' : 'text.secondary',
                  '&:hover': {bgcolor: 'action.hover'},
                }}
            >
              {saved ? <BookmarkIcon fontSize="small"/> : <BookmarkAddIcon fontSize="small"/>}
              <Typography variant="caption" color="inherit">
                  {saved ? 'Added ✓' : 'Add to my schedule'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
