import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6200ea' },
    background: { default: '#121212', paper: '#1e1e1e' },
    success: { main: '#4caf50' },
  },
});

export default theme;
