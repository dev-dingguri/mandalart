import {
  PaletteOptions,
  SimplePaletteColorOptions,
  createTheme,
} from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

type DefaultPaletteOptions = PaletteOptions & {
  primary?: SimplePaletteColorOptions;
  secondary?: SimplePaletteColorOptions;
  error?: SimplePaletteColorOptions;
  warning?: SimplePaletteColorOptions;
  filter?: {
    primary: string;
    secondary: string;
  };
  backdrop?: string;
};

const theme = (mode: PaletteMode) => {
  const palette: DefaultPaletteOptions = {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#FFFFFF',
            dark: '#EEF0F2',
          },
          secondary: { main: '#5796F8' },
          error: { main: '#cc3300' },
          background: {
            default: '#EEF0F2',
            paper: '#EEF0F2',
          },
          text: {
            primary: '#323232',
            secondary: '#4e4e4e',
          },
          filter: {
            primary: 'rgba(17, 15, 13, 0.02)',
            secondary: 'rgba(17, 15, 13, 0.3)',
          },
        }
      : {
          primary: {
            main: '#494949',
            dark: '#272727',
          },
          secondary: { main: '#1670FC' },
          error: { main: '#b84c4b' },
          background: {
            default: '#272727',
            paper: '#272727',
          },
          text: {
            primary: '#e9ebee',
            secondary: '#BCBEBF',
          },
          filter: {
            primary: 'rgba(255, 255, 255, 0.1)',
            secondary: 'rgba(255, 255, 255, 0.35)',
          },
        }),
  };

  return createTheme({
    palette,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            /* Scrollbar */
            /* Chrome, Opera, Safari */
            '::-webkit-scrollbar': {
              width: 'var(--size-scrollbar-width)',
              height: 'var(--size-scrollbar-width)',
            },
            '::-webkit-scrollbar-track': {
              backgroundColor: palette.primary?.dark,
            },
            '::-webkit-scrollbar-thumb': {
              backgroundColor: palette.primary?.main,
              borderRadius: 'calc(var(--size-scrollbar-width) / 2)',
            },
            '@media (hover: hover) and (pointer: fine)': {
              '::-webkit-scrollbar-thumb:hover': {
                boxShadow: `inset 0 0 0 10em ${palette.filter?.primary}`,
              },
            },
            /* !Chrome, Opera, Safari */
            /* Firefox */
            scrollbarWidth: 'thin',
            scrollbarColor: `${palette.primary?.main} ${palette.primary?.dark}`,
            /* !Firefox */
            /* !Scrollbar */
          },
        },
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&&': {
              textTransform: 'none',
              '&:hover': {
                boxShadow: `inset 0 0 0 10em ${palette.filter?.primary}`,
              },
            },
            '&& .MuiTouchRipple-rippleVisible': {
              // animationDuration: '300ms',
            },
            '&& .MuiTouchRipple-child': {
              backgroundColor: palette.filter?.secondary,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: palette.text?.primary,
            backgroundColor: palette.primary?.main,
            '&:hover': {
              backgroundColor: palette.primary?.main,
            },
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
      MuiToggleButton: {
        styleOverrides: {
          root: {
            color: palette.text?.primary,
            backgroundColor: palette.primary?.main,
            border: 'none',
            '&:hover': {
              backgroundColor: palette.primary?.main,
            },
            '&.Mui-selected': {
              color: 'unset',
              backgroundColor: palette.secondary?.main,
              '&:hover': {
                backgroundColor: palette.secondary?.main,
              },
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            '&.Mui-focused': {
              color: palette.text?.primary,
              fontWeight: '600',
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              paddingTop: '0.7em',
              paddingBottom: '0.7em',
            },
            '&&.Mui-focused:not(.Mui-error)': {
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'unset',
                borderWidth: '0.1rem',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.background?.default,
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(2px)',
            backgroundColor: palette.filter?.primary,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              backgroundImage: 'none',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          root: {
            '& .MuiPaper-root': {
              backgroundImage: 'none',
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 'bold',
            padding: '16px 24px',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
            '.MuiDialogContent-root+&': {
              paddingTop: '0',
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          root: {
            '& .MuiBackdrop-root': {
              backdropFilter: 'none',
              backgroundColor: 'unset',
            },
            '& .MuiPaper-root': {
              backgroundImage: `linear-gradient(${palette.filter?.primary}, ${palette.filter?.primary})`,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            ':not(.MuiTypography-noWrap)': { whiteSpace: 'pre-line' },
          },
        },
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
        color: palette.text?.primary,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: palette.text?.primary,
      },
      h3: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: palette.text?.primary,
      },
      subtitle1: {
        fontSize: '1.1rem',
        fontWeight: '500',
        color: palette.text?.primary,
      },
      subtitle2: {
        fontSize: '1.1rem',
        fontWeight: '500',
        color: palette.text?.secondary,
      },
      body1: {
        fontSize: '1rem',
        color: palette.text?.primary,
      },
      body2: {
        fontSize: '0.85rem',
        color: palette.text?.secondary,
      },
    },
  });
};

export default theme;
