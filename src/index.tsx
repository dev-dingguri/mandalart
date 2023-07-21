import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { IconContext } from 'react-icons/lib';
import { ThemeProvider as ThemeSelectProvider } from 'contexts/ThemeContext';
import { AlertProvider } from 'contexts/AlertContext';
import { HelmetProvider } from 'react-helmet-async';
import { FirebaseSdksProvider } from 'contexts/FirebaseSdksContext';
import 'locales/i18n';
import { LoadingProvider } from 'contexts/LoadingContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const theme = createTheme({
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&& .MuiTouchRipple-rippleVisible': {
            animationDuration: '200ms',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          '&& .MuiTouchRipple-child': {
            borderRadius: '4px',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          '&& .MuiBackdrop-root': {
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '&& .MuiBackdrop-root': {
            backdropFilter: 'blur(2px)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h2',
          h4: 'h2',
          h5: 'h2',
          h6: 'h2',
          subtitle1: 'h2',
          subtitle2: 'h2',
        },
      },
    },
  },
  typography: {
    h1: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    h3: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    subtitle2: {
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#4e4e4e',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.85rem',
      color: '#4e4e4e',
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <IconContext.Provider value={{ className: 'react-icons' }}>
        <FirebaseSdksProvider firebaseConfig={firebaseConfig}>
          <LoadingProvider>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <ThemeSelectProvider>
                  <AlertProvider>
                    <App />
                  </AlertProvider>
                </ThemeSelectProvider>
              </ThemeProvider>
            </StyledEngineProvider>
          </LoadingProvider>
        </FirebaseSdksProvider>
      </IconContext.Provider>
    </HelmetProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
