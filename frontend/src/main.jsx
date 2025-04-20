import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App.jsx';

// Create a theme based on the previous CSS variables
const theme = createTheme({
  palette: {
    primary: {
      main: '#5d5fef',
      light: '#7a7cf8',
      dark: '#4445c9',
    },
    secondary: {
      main: '#00cfde',
      light: '#59e6f3',
      dark: '#00a0ac',
    },
    success: {
      main: '#00c853',
      light: '#5efc82', 
      dark: '#009624',
    },
    warning: {
      main: '#ffc107',
      light: '#ffe082',
      dark: '#ffa000',
    },
    error: {
      main: '#ff385c',
      light: '#ff7086',
      dark: '#d30029',
    },
    background: {
      default: '#f7f7fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1b1b25',
      secondary: '#58586d',
    },
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 16,
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-3px)',
          },
          transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
          transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
