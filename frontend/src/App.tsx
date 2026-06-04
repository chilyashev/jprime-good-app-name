import { useState } from 'react';
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
import { useTheme, useMediaQuery } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AgendaPage from './pages/AgendaPage';
import PlanPage from './pages/PlanPage';
import { getPlanCount } from './utils/visitPlan';

type Page = 'agenda' | 'plan';

export default function App() {
  const [page, setPage] = useState<Page>('agenda');
  const [planCount, setPlanCount] = useState(() => getPlanCount());

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>jPrime 2026</Typography>
            <Tabs value={page} onChange={(_, v) => setPage(v)}>
              <Tab icon={<EventIcon />} label="Agenda" value="agenda" iconPosition="start" />
              <Tab
                icon={planBadge}
                label="My Plan"
                value="plan"
                iconPosition="start"
              />
            </Tabs>
          </Toolbar>
        </AppBar>
      ) : (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>jPrime 2026</Typography>
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
          <BottomNavigation
            value={page}
            onChange={(_, v) => setPage(v)}
            showLabels
          >
            <BottomNavigationAction label="Agenda" value="agenda" icon={<EventIcon />} />
            <BottomNavigationAction
              label="My Plan"
              value="plan"
              icon={planBadge}
            />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
