import { useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import openSourceLicensesJson from 'assets/data/openSourceLicenses.json';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import InfiniteScroll from 'react-infinite-scroll-component';

/*
 * openSourceLicenses.json
 * Created with 'license-checker --production -excludePrivatePackages --customPath [customPath.json] --json > openSourceLicenses.json'
 * 만들어진 파일에 공백("")이 있을 수 있습니다.
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

const licensesObj: { [key: string]: License } = openSourceLicensesJson;
const licenses = Object.keys(licensesObj).map((key) => licensesObj[key]);

const Item = ({ name, licenses, repository }: License) => {
  return (
    <>
      <ListItem
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
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
      </ListItem>
      <Divider component="li" />
    </>
  );
};

const OpenSourceLicensesPage = () => {
  const [currentLicenses, setCurrentLicenses] = useState<License[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentLicenses(licenses.slice(0, 50));
  }, []);

  const appendLicenses = () => {
    setTimeout(() => {
      setCurrentLicenses((currentLicenses) =>
        licenses.slice(0, currentLicenses.length + 50)
      );
    }, 300);
  };

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
      }}
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
          <IconButton
            onClick={() => navigate('..')}
            sx={{ marginRight: '0.25em' }}
          >
            <BsChevronLeft />
          </IconButton>
          <Typography variant="h1">{t('oss.label')}</Typography>
        </Toolbar>
      </AppBar>
      <Divider flexItem />
      <Box
        id="scrollableBox"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          overflowY: 'auto',
          scrollbarGutter: 'stable both-edges',
        }}
      >
        <InfiniteScroll
          dataLength={currentLicenses.length}
          next={appendLicenses}
          hasMore={currentLicenses.length < licenses.length}
          loader={
            <CircularProgress size="3rem" thickness={4} sx={{ m: '0.5em' }} />
          }
          scrollableTarget="scrollableBox"
        >
          <List
            sx={{
              width: 'var(--size-content-width)',
              minWidth: 'var(--size-content-min-width)',
              padding: 0,
            }}
          >
            {currentLicenses.map((data, idx) => (
              <Item key={idx} {...data} />
            ))}
          </List>
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default OpenSourceLicensesPage;
