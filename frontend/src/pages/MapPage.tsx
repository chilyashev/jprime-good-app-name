import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function MapPage() {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5}}>
                <LocationOnIcon color="primary"/>
                <Box>
                    <Typography variant="subtitle1" sx={{fontWeight: 700}}>jPrime 2026 Venue</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Inter Expo Center Sofia · Tsarigradsko Shose Blvd 147, Sofia
                    </Typography>
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
                <iframe
                    title="jPrime venue map"
                    src="https://maps.google.com/maps?q=Inter+Expo+Center+Sofia+Bulgaria&output=embed"
                    width="100%"
                    height="100%"
                    style={{border: 0, borderRadius: 8}}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </Box>
        </Box>
    );
}
