import {createTheme} from '@mui/material/styles';

export function createAppTheme(mode: 'light' | 'dark') {
    return createTheme({
        palette: {
            mode,
            primary: {main: '#6200ea'},
            ...(mode === 'dark'
                ? {background: {default: '#121212', paper: '#1e1e1e'}}
                : {background: {default: '#f5f5f5', paper: '#ffffff'}}),
            success: {main: '#4caf50'},
        },
    });
}
