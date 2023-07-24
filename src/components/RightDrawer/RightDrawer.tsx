import React from 'react';
import styles from './RightDrawer.module.css';
import { useNavigate } from 'react-router-dom';
import { Theme, useTheme } from 'contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsYoutube } from 'react-icons/bs';
import { APP_VERSION } from 'version';
import { PATH_OSS } from '../../constants/constants';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type ItemProps = {
  className?: string;
  text?: string | null;
  children?: React.ReactNode;
  onClick?: () => void;
};

const Item = ({ className, text, children, onClick }: ItemProps) => {
  return (
    <ListItem className={`${styles.item} ${className}`} onClick={onClick}>
      {text && <ListItemText primary={text} />}
      {children}
    </ListItem>
  );
};

type ThemeOption = {
  value: Theme;
  name: string;
};

type RightAsideProps = {
  isShown: boolean;
  onClose: () => void;
};

const RightAside = ({ isShown, onClose }: RightAsideProps) => {
  const { theme, selectTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const themeOptions: ThemeOption[] = [
    { value: 'system', name: t('theme.options.system') },
    { value: 'light', name: t('theme.options.light') },
    { value: 'dark', name: t('theme.options.dark') },
  ];
  const handleSelectTheme = (event: SelectChangeEvent) => {
    selectTheme(event.target.value as Theme);
  };

  const languageOptions = [
    { value: 'en', name: 'English' },
    { value: 'ko', name: '한국어' },
    { value: 'ja', name: '日本語' },
  ];
  const handleSelectlanguage = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  const navigate = useNavigate();
  const goToOpenSourceLicense = () => {
    navigate(`/${i18n.language}${PATH_OSS}`);
  };

  return (
    <Drawer anchor="right" open={isShown} onClose={onClose}>
      <div className={`${styles.aside}`}>
        <List className={styles.list}>
          <Item>
            <FormControl fullWidth>
              <InputLabel id="theme-label">{t('theme.label')}</InputLabel>
              <Select
                labelId="theme-label"
                id="theme-select"
                value={theme}
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
          </Item>
          <Item>
            <FormControl fullWidth>
              <InputLabel id="language-label">{t('language.label')}</InputLabel>
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
          </Item>
          <Item
            text={t('oss.label')}
            className={styles.oss}
            onClick={goToOpenSourceLicense}
          />
          <Item text={t('version.label')}>
            <Typography variant="body1" className={styles.itemSub}>
              {APP_VERSION}
            </Typography>
          </Item>
        </List>
        <div className={styles.contact}>
          <Typography variant="body2">dingguri.lab@gmail.com</Typography>
          <div className={styles.sites}>
            <BsYoutube
              className={styles.siteIcon}
              onClick={() => {
                window.open(
                  'https://www.youtube.com/channel/UCoZkSE87r1jR1HasRJpPX3g'
                );
              }}
            />
            <BsGithub
              className={styles.siteIcon}
              onClick={() => {
                window.open('https://github.com/dev-dingguri/mandalart');
              }}
            />
          </div>
          <Typography variant="body2">
            DINGGURI.LAB. ALL RIGHTS RESERVED
          </Typography>
        </div>
      </div>
    </Drawer>
  );
};

export default RightAside;
