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
import type {Session} from '../api/sessionsApi';
import {addToPlan, isInPlan, removeFromPlan} from '../utils/visitPlan';

function formatTime(dt: string): string {
  return dt.slice(11, 16);
}

interface Props {
  session: Session;
  onPlanChange?: () => void;
}

export default function SessionCard({ session, onPlanChange }: Props) {
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
  const speakers = [session.lectorName, session.coLectorName].filter(Boolean).join(', ');

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, flex: 1 }}>
            {session.title ?? '(Untitled)'}
          </Typography>
          <Chip label={timeLabel} color="primary" size="small" sx={{ flexShrink: 0, mt: 0.5 }} />
        </Box>

        {speakers && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {speakers}
          </Typography>
        )}

        {session.talkDescription && (
          <>
            <Link
              component="button"
              variant="caption"
              onClick={() => setExpanded(e => !e)}
              sx={{ mt: 0.5, display: 'block', textAlign: 'left' }}
            >
              {expanded ? 'Show less' : 'Read more'}
            </Link>
            <Collapse in={expanded}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {session.talkDescription}
              </Typography>
            </Collapse>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Tooltip title={saved ? 'Remove from plan' : 'Add to plan'}>
            <Box
                component="button"
              onClick={toggle}
              aria-label={saved ? 'Remove session from plan' : 'Add session to plan'}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5,
                  background: 'none', border: 'none', cursor: 'pointer', p: 0.5, borderRadius: 1,
                  color: saved ? 'success.main' : 'text.secondary',
                  '&:hover': {bgcolor: 'action.hover'},
                }}
            >
              {saved ? <BookmarkIcon fontSize="small"/> : <BookmarkAddIcon fontSize="small"/>}
              <Typography variant="caption" color="inherit">
                {saved ? 'Added ✓' : 'Add to Plan'}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
