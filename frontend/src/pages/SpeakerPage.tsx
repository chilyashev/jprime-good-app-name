import {useEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SessionCard from '../components/SessionCard';
import {fetchSpeaker, type SpeakerDetail} from '../api/speakersApi';

function localNow(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

interface Props {
    speakerId: number;
    onBack: () => void;
    onPlanChange: () => void;
    onSpeakerClick: (id: number) => void;
}

export default function SpeakerPage({speakerId, onBack, onPlanChange, onSpeakerClick}: Props) {
    const [speaker, setSpeaker] = useState<SpeakerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [now, setNow] = useState(localNow);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => setNow(localNow()), 30_000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    useEffect(() => {
        setLoading(true);
        setError(false);
        setSpeaker(null);
        fetchSpeaker(speakerId)
            .then(setSpeaker)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [speakerId]);

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider'
            }}>
                <IconButton onClick={onBack} aria-label="Back" size="small">
                    <ArrowBackIcon/>
                </IconButton>
                <Typography variant="h6" sx={{fontWeight: 700}}>Speaker</Typography>
            </Box>

            {loading && (
                <Box sx={{display: 'flex', justifyContent: 'center', pt: 6}}>
                    <CircularProgress/>
                </Box>
            )}

            {!loading && error && (
                <Box sx={{textAlign: 'center', pt: 6}}>
                    <PersonIcon sx={{fontSize: 48, color: 'text.disabled', mb: 2}}/>
                    <Typography variant="body1" color="text.secondary">Could not load speaker</Typography>
                </Box>
            )}

            {!loading && speaker && (
                <Box sx={{px: 2, py: 2}}>
                    <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2}}>
                        <Avatar
                            src={speaker.imageUrl ?? undefined}
                            alt={speaker.name}
                            sx={{width: 80, height: 80, flexShrink: 0}}
                        >
                            {!speaker.imageUrl && <PersonIcon sx={{fontSize: 40}}/>}
                        </Avatar>
                        <Typography variant="h5" sx={{fontWeight: 700, pt: 1}}>{speaker.name}</Typography>
                    </Box>

                    {speaker.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{mb: 3, lineHeight: 1.6}}>
                            {speaker.bio}
                        </Typography>
                    )}

                    <Typography variant="subtitle1" sx={{fontWeight: 600, mb: 1}}>
                        Sessions ({speaker.sessions.length})
                    </Typography>

                    {speaker.sessions.length === 0 && (
                        <Typography variant="body2" color="text.secondary">No sessions found</Typography>
                    )}

                    {speaker.sessions.map(s => (
                        <SessionCard
                            key={s.id}
                            session={s}
                            isCurrent={s.startTime.slice(0, 19) <= now && s.endTime.slice(0, 19) > now}
                            onPlanChange={onPlanChange}
                            onSpeakerClick={onSpeakerClick}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}
