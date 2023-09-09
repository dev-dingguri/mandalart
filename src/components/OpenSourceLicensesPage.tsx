import { useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH_MAIN } from 'constants/constants';
import licenseMap from 'assets/data/openSourceLicenses.json';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

/*
 * openSourceLicenses.json
 * Created with 'license-checker --production -excludePrivatePackages --customPath [customPath.json] --json > openSourceLicenses.json'
 *
 * [customPath.json]
 * {
 *   "name": "",
 *   "version": false,
 *   "description": false,
 *   "repository": "",
 *   "publisher": false,
 *   "email": false,
 *   "url": false,
 *   "licenses": "",
 *   "licenseFile": false,
 *   "licenseText": false,
 *   "licenseModified": false,
 *   "copyright": false,
 *   "path": false
 *  }
 */

type License = {
  name: string;
  licenses: string;
  repository: string;
};

const Item = ({ name, licenses, repository }: License) => {
  return (
    <ListItem
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '0.25em 0',
      }}
    >
      <Typography variant="subtitle1">{name}</Typography>
      <Typography variant="body2">{licenses}</Typography>
      <Link
        href={repository}
        target="blank"
        color="inherit"
        underline="none"
        variant="body2"
      >
        {repository}
      </Link>
      <Divider flexItem />
    </ListItem>
  );
};

const OpenSourceLicensesPage = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const { t, i18n } = useTranslation();
  const lang = i18n.languages[0];

  useEffect(() => {
    setLicenses(mapToArray(licenseMap));
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const goToBack = () => {
    if (location.key === 'default') {
      navigate(`/${lang}${PATH_MAIN}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          width: 'var(--size-content-width)',
          minWidth: 'var(--size-content-min-width)',
          '& .MuiToolbar-root': {
            padding: '0',
          },
        }}
      >
        <Toolbar>
          <IconButton onClick={goToBack} sx={{ marginRight: '0.25em' }}>
            <BsChevronLeft />
          </IconButton>
          <Typography variant="h1">{t('oss.label')}</Typography>
        </Toolbar>
      </AppBar>
      <Divider flexItem />
      <List
        sx={{
          width: 'var(--size-content-width)',
          minWidth: 'var(--size-content-min-width)',
          overflow: 'auto',
          scrollbarGutter: 'stable both-edges',
        }}
      >
        {licenses.map((data, idx) => (
          <Item key={idx} {...data} />
        ))}
      </List>
    </Box>
  );
};

const mapToArray = (licenseMap: { [key: string]: License }) => {
  return Object.keys(licenseMap).map((key) => licenseMap[key]);
};

export default OpenSourceLicensesPage;
