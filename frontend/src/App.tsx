import {useEffect, useMemo, useState} from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {ThemeProvider, useMediaQuery, useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MapIcon from '@mui/icons-material/Map';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AgendaPage from './pages/AgendaPage';
import {type ConferenceSettings, fetchConferenceSettings} from './api/conferenceApi';
import PlanPage from './pages/PlanPage';
import MapPage from './pages/MapPage';
import SpeakerPage from './pages/SpeakerPage';
import {getPlanCount} from './utils/visitPlan';
import {createAppTheme} from './theme';

type Page = 'agenda' | 'plan' | 'map';
type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'jprime-theme-mode';

const themeModeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  {value: 'light', label: 'Light', icon: <LightModeIcon fontSize="small"/>},
  {value: 'dark', label: 'Dark', icon: <DarkModeIcon fontSize="small"/>},
  {value: 'system', label: 'System', icon: <SettingsBrightnessIcon fontSize="small"/>},
];

function ThemeToggle({mode, onChange}: { mode: ThemeMode; onChange: (m: ThemeMode) => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = themeModeOptions.find(o => o.value === mode)!;
  return (
      <>
        <IconButton onClick={e => setAnchor(e.currentTarget)} color="inherit" size="small" aria-label="Switch theme">
          {current.icon}
        </IconButton>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {themeModeOptions.map(opt => (
              <MenuItem
                  key={opt.value}
                  selected={opt.value === mode}
                  onClick={() => {
                    onChange(opt.value);
                    setAnchor(null);
                  }}
              >
                <ListItemIcon>{opt.icon}</ListItemIcon>
                <ListItemText>{opt.label}</ListItemText>
              </MenuItem>
          ))}
        </Menu>
      </>
  );
}

interface AppContentProps {
  themeMode: ThemeMode;
  onThemeModeChange: (m: ThemeMode) => void;
}

function AppContent({themeMode, onThemeModeChange}: AppContentProps) {
  const [page, setPage] = useState<Page>('agenda');
  const [planCount, setPlanCount] = useState(() => getPlanCount());
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>('agenda');
  const [conference, setConference] = useState<ConferenceSettings | null>(null);

  useEffect(() => {
    fetchConferenceSettings().then(setConference).catch(() => {
    });
  }, []);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  function handleThemeChange(m: ThemeMode) {
    onThemeModeChange(m);
    localStorage.setItem(THEME_KEY, m);
  }

  function handlePlanChange() {
    setPlanCount(getPlanCount());
  }

  const planBadge = planCount > 0 ? (
    <Badge badgeContent={planCount} color="primary">
      <EventNoteIcon />
    </Badge>
  ) : <EventNoteIcon />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop ? (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer'}}
                 onClick={() => handlePageChange('agenda')}>
              {conference?.logoUrl && (
                  <img src={conference.logoUrl} alt="logo" style={{height: 32, width: 'auto'}}/>
              )}
              <Typography variant="h6" color="primary" sx={{fontWeight: 700}}>
                {conference ? `${conference.name} ${conference.year}` : 'jPrime 2026'}
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              {!selectedSpeakerId && (
                  <Tabs value={page} onChange={(_, v) => handlePageChange(v)}>
                    <Tab icon={<EventIcon/>} label="Agenda" value="agenda" iconPosition="start"/>
                    <Tab icon={planBadge} label="My Plan" value="plan" iconPosition="start"/>
                    <Tab icon={<MapIcon/>} label="Map" value="map" iconPosition="start"/>
                  </Tabs>
              )}
              <ThemeToggle mode={themeMode} onChange={handleThemeChange}/>
            </Box>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{justifyContent: 'space-between'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer'}}
                 onClick={() => handlePageChange('agenda')}>
              {conference?.logoUrl && (
                  <img src={conference.logoUrl} alt="logo" style={{height: 32, width: 'auto'}}/>
              )}
              <Typography variant="h6" color="primary" sx={{fontWeight: 700}}>
                {conference ? `${conference.name} ${conference.year}` : 'jPrime 2026'}
              </Typography>
            </Box>
            <ThemeToggle mode={themeMode} onChange={handleThemeChange}/>
          </Toolbar>
        </AppBar>
      )}

      <Container maxWidth={isDesktop ? 'xl' : 'sm'} sx={{ flex: 1, py: 0, pb: isDesktop ? 0 : 8 }}>
        {page === 'agenda' && <AgendaPage onPlanChange={handlePlanChange} />}
        {page === 'plan' && (
          <PlanPage
            onGoToAgenda={() => setPage('agenda')}
            planCount={planCount}
          />
        )}
      </Container>

      {!isDesktop && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={page} onChange={(_, v) => handlePageChange(v)} showLabels>
            <BottomNavigationAction label="Agenda" value="agenda" icon={<EventIcon />} />
            <BottomNavigationAction label="My Plan" value="plan" icon={planBadge}/>
            <BottomNavigationAction label="Map" value="map" icon={<MapIcon/>}/>
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(
      () => (localStorage.getItem(THEME_KEY) as ThemeMode | null) ?? 'system'
  );
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => {
    const mode = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
    return createAppTheme(mode);
  }, [themeMode, prefersDark]);

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline/>
        <AppContent themeMode={themeMode} onThemeModeChange={setThemeMode}/>
      </ThemeProvider>
  );
}
