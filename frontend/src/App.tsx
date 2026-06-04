import {useEffect, useMemo, useState} from 'react';
import {Navigate, Route, Routes, useLocation, useNavigate, useParams} from 'react-router-dom';
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
import Divider from '@mui/material/Divider';
import {ThemeProvider, useMediaQuery, useTheme} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MapIcon from '@mui/icons-material/Map';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckIcon from '@mui/icons-material/Check';
import AgendaPage from './pages/AgendaPage';
import {type ConferenceSettings, fetchConferenceSettings} from './api/conferenceApi';
import PlanPage from './pages/PlanPage';
import MapPage from './pages/MapPage';
import SpeakerPage from './pages/SpeakerPage';
import {getPlanCount} from './utils/visitPlan';
import {createAppTheme} from './theme';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'jprime-theme-mode';

const today = new Date().toISOString().slice(0, 10);

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function pickDay(available: string[], prev: string): string {
  if (prev && available.includes(prev)) return prev;
  return available.includes(today) ? today : (available[0] ?? '');
}

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

interface SpeakerPageRouteProps {
  onPlanChange: () => void;
  onSpeakerClick: (id: number) => void;
}

function SpeakerPageRoute({onPlanChange, onSpeakerClick}: SpeakerPageRouteProps) {
  const {speakerId} = useParams<{ speakerId: string }>();
  const navigate = useNavigate();
  return (
      <SpeakerPage
          speakerId={Number(speakerId)}
          onBack={() => navigate(-1)}
          onPlanChange={onPlanChange}
          onSpeakerClick={(id) => navigate(`/speaker/${id}`)}
      />
  );
}

interface AppContentProps {
  themeMode: ThemeMode;
  onThemeModeChange: (m: ThemeMode) => void;
}

function AppContent({themeMode, onThemeModeChange}: AppContentProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [planCount, setPlanCount] = useState(() => getPlanCount());
  const [conference, setConference] = useState<ConferenceSettings | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [agendaMenuAnchor, setAgendaMenuAnchor] = useState<HTMLElement | null>(null);

  const isSpeakerPage = location.pathname.startsWith('/speaker/');
  const page = location.pathname.startsWith('/plan') ? 'plan'
      : location.pathname.startsWith('/map') ? 'map'
          : 'agenda';

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

  function handleSpeakerClick(speakerId: number) {
    navigate(`/speaker/${speakerId}`);
  }

  function handlePageChange(newPage: string) {
    navigate(`/${newPage}`);
  }

  function handleDaysLoaded(loadedDays: string[]) {
    setDays(loadedDays);
    setSelectedDay(prev => pickDay(loadedDays, prev));
  }

  function handleAgendaNavClick(e: React.MouseEvent<HTMLElement>) {
    navigate('/agenda');
    if (days.length > 0) setAgendaMenuAnchor(e.currentTarget);
  }

  function handleDaySelect(day: string) {
    setSelectedDay(day);
    setAgendaMenuAnchor(null);
  }

  const agendaLabel = selectedDay ? formatDayLabel(selectedDay) : 'Agenda';

  const planBadge = planCount > 0 ? (
    <Badge badgeContent={planCount} color="primary">
      <EventNoteIcon />
    </Badge>
  ) : <EventNoteIcon />;

  const dayMenu = (
    <Menu
      anchorEl={agendaMenuAnchor}
      open={Boolean(agendaMenuAnchor)}
      onClose={() => setAgendaMenuAnchor(null)}
      anchorOrigin={isDesktop
        ? { vertical: 'bottom', horizontal: 'left' }
        : { vertical: 'top', horizontal: 'center' }}
      transformOrigin={isDesktop
        ? { vertical: 'top', horizontal: 'left' }
        : { vertical: 'bottom', horizontal: 'center' }}
    >
      <MenuItem disabled sx={{ opacity: '1 !important' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select day
        </Typography>
      </MenuItem>
      <Divider />
      {days.map(day => (
        <MenuItem key={day} onClick={() => handleDaySelect(day)}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            {selectedDay === day
              ? <CheckIcon fontSize="small" color="primary" />
              : <Box sx={{ width: 20 }} />}
          </ListItemIcon>
          <ListItemText>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {formatDayLabel(day)}
              {day === today && (
                <Typography component="span" variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                  Today
                </Typography>
              )}
            </Box>
          </ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop ? (
          <AppBar position="sticky" color="default" elevation={1}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer'}}
                 onClick={() => navigate('/agenda')}>
              {conference?.logoUrl && (
                  <img src={conference.logoUrl} alt="logo" style={{height: 32, width: 'auto'}}/>
              )}
              <Typography variant="h6" color="primary" sx={{fontWeight: 700}}>
                {conference ? `${conference.name} ${conference.year}` : 'jPrime 2026'}
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              {!isSpeakerPage && (
                  <Tabs value={page} onChange={(_, v) => handlePageChange(v)}>
                    <Tab
                      icon={<EventIcon/>}
                      label={
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          {agendaLabel}
                          <ArrowDropDownIcon sx={{ fontSize: 18, ml: 0.25, mb: '-1px' }} />
                        </Box>
                      }
                      value="agenda"
                      iconPosition="start"
                      onClick={handleAgendaNavClick}
                    />
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
                 onClick={() => navigate('/agenda')}>
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

      {dayMenu}

      <Container maxWidth={isDesktop ? 'xl' : false} disableGutters={!isDesktop}
                 sx={{flex: 1, py: 0, pb: isDesktop ? 0 : 8}}>
        <Routes>
          <Route path="/" element={<Navigate to="/agenda" replace/>}/>
          <Route path="/agenda" element={
            <AgendaPage
                selectedDay={selectedDay}
                onDaysLoaded={handleDaysLoaded}
                onPlanChange={handlePlanChange}
                onSpeakerClick={handleSpeakerClick}
            />
          }/>
          <Route path="/plan" element={
            <PlanPage
                onGoToAgenda={() => navigate('/agenda')}
                planCount={planCount}
                onPlanChange={handlePlanChange}
                onSpeakerClick={handleSpeakerClick}
            />
          }/>
          <Route path="/map" element={<MapPage/>}/>
          <Route path="/speaker/:speakerId" element={
            <SpeakerPageRoute
                onPlanChange={handlePlanChange}
                onSpeakerClick={handleSpeakerClick}
            />
          }/>
        </Routes>
      </Container>

      {!isDesktop && !isSpeakerPage && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={page} onChange={(_, v) => handlePageChange(v)} showLabels>
            <BottomNavigationAction
              label={agendaLabel}
              value="agenda"
              icon={<EventIcon />}
              onClick={handleAgendaNavClick}
            />
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
