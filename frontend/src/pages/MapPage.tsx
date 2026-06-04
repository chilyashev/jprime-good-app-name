import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {type ConferenceSettings} from '../api/conferenceApi';

interface Props {
    conference: ConferenceSettings | null;
}

export default function MapPage({conference}: Props) {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5}}>
                <LocationOnIcon color="primary"/>
                <Box>
                    {conference
                        ? <Typography variant="subtitle1" sx={{fontWeight: 700}}>{conference.venueName}</Typography>
                        : <Skeleton width={180} height={24}/>
                    }
                    {conference
                        ? <Typography variant="caption" color="text.secondary">{conference.venueAddress}</Typography>
                        : <Skeleton width={280} height={16}/>
                    }
                </Box>
            </Box>
            <Typography>
                TODO: Add an awesome map of the venue.
            </Typography>
            <Box sx={{px: 2, pb: 1, display: 'flex', justifyContent: {xs: 'flex-start', md: 'center'}}}>
                <Box
                    component="img"
                    src="/doom_map.jpg"
                    alt="Venue map"
                    sx={{width: {xs: '100%', md: '50%'}, borderRadius: 2, display: 'block'}}
                />
            </Box>
            <Box sx={{flex: 1, px: 2, pb: 2}}>
                {conference?.venueMapUrl && (
                    <iframe
                        title={conference.venueName ?? 'Venue map'}
                        src={conference.venueMapUrl}
                        width="100%"
                        height="100%"
                        style={{border: 0, borderRadius: 8}}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                )}
            </Box>
        </Box>
    );
}
