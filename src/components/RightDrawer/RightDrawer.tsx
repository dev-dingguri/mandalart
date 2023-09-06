import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsYoutube } from 'react-icons/bs';
import { APP_VERSION } from 'version';
import { PATH_OSS } from '../../constants/constants';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import { useTernaryDarkMode } from 'usehooks-ts';

type RightAsideProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RightAside = ({ isOpen, onClose }: RightAsideProps) => {
  const { ternaryDarkMode, setTernaryDarkMode } = useTernaryDarkMode();
  type TernaryDarkMode = typeof ternaryDarkMode;

  const { t, i18n } = useTranslation();

  type ThemeOption = {
    value: TernaryDarkMode;
    name: string;
  };
  const themeOptions: ThemeOption[] = [
    { value: 'system', name: t('theme.options.system') },
    { value: 'light', name: t('theme.options.light') },
    { value: 'dark', name: t('theme.options.dark') },
  ];
  const handleSelectTheme = (ev: SelectChangeEvent) => {
    setTernaryDarkMode(ev.target.value as TernaryDarkMode);
  };

  const languageOptions = [
    { value: 'en', name: 'English' },
    { value: 'ko', name: '한국어' },
    { value: 'ja', name: '日本語' },
  ];
  const handleSelectlanguage = (ev: SelectChangeEvent) => {
    i18n.changeLanguage(ev.target.value);
  };

  const navigate = useNavigate();
  const goToOpenSourceLicense = () => {
    navigate(`/${i18n.language}${PATH_OSS}`);
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      sx={{
        '&& .MuiPaper-root': {
          width: '70vw',
          '@media screen and (min-width: 30rem)': {
            width: '21rem',
          },
        },
      }}
    >
      <List sx={{ overflow: 'auto', scrollbarGutter: 'stable both-edges' }}>
        <ListItem>
          <FormControl sx={{ mt: 1, mb: 1, width: '100%' }}>
            <InputLabel
              id="theme-label"
              sx={{
                backgroundColor: (theme) => theme.palette.primary.dark,
                paddingRight: '0.5em',
              }}
              variant="outlined"
            >
              {t('theme.label')}
            </InputLabel>
            <Select
              labelId="theme-label"
              id="theme-select"
              value={ternaryDarkMode}
              label="Age"
              onChange={handleSelectTheme}
            >
              {themeOptions.map(({ value, name }) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <Divider variant="middle" component="li" />
        <ListItem>
          <FormControl sx={{ mt: 1, mb: 1, width: '100%' }}>
            <InputLabel
              id="language-label"
              sx={{
                backgroundColor: (theme) => theme.palette.primary.dark,
                paddingRight: '0.5em',
              }}
            >
              {t('language.label')}
            </InputLabel>
            <Select
              labelId="language-label"
              id="language-select"
              value={i18n.language}
              label="language"
              onChange={handleSelectlanguage}
            >
              {languageOptions.map(({ value, name }) => (
                <MenuItem key={value} value={value}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <Divider variant="middle" component="li" />
        <ListItem sx={{ cursor: 'pointer' }} onClick={goToOpenSourceLicense}>
          <ListItemText primary={t('oss.label')} />
        </ListItem>
        <Divider variant="middle" component="li" />
        <ListItem>
          <ListItemText
            primary={t('version.label')}
            secondary={APP_VERSION}
            sx={{
              display: 'flex',
              alignItems: 'center',
              '.MuiListItemText-secondary': { ml: '0.5em' },
            }}
          />
        </ListItem>
        <Divider variant="middle" component="li" />
        <ListItem>
          <ListItemText secondary="dingguri.lab@gmail.com" />
        </ListItem>
        <ListItem
          sx={{
            '& .react-icons': {
              fontSize: '1.6rem',
              mr: '0.5em',
              cursor: 'pointer',
            },
          }}
        >
          <BsYoutube
            onClick={() => {
              window.open(
                'https://www.youtube.com/channel/UCoZkSE87r1jR1HasRJpPX3g'
              );
            }}
          />
          <BsGithub
            onClick={() => {
              window.open('https://github.com/dev-dingguri/mandalart');
            }}
          />
        </ListItem>
        <ListItem>
          <ListItemText secondary="DINGGURI.LAB. ALL RIGHTS RESERVED" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default RightAside;
