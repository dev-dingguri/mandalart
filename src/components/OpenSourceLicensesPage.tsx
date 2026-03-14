import { useCallback, useEffect, useRef, useState } from 'react';
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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = currentLicenses.length < licenses.length;

  useEffect(() => {
    setCurrentLicenses(licenses.slice(0, 50));
  }, []);

  const appendLicenses = useCallback(() => {
    setCurrentLicenses((prev) => licenses.slice(0, prev.length + 50));
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          appendLicenses();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [appendLicenses]);

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
        sx={{
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          overflowY: 'auto',
          scrollbarGutter: 'stable both-edges',
        }}
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
        {hasMore && (
          <div ref={sentinelRef}>
            <CircularProgress size="3rem" thickness={4} sx={{ m: '0.5em' }} />
          </div>
        )}
      </Box>
    </Box>
  );
};

export default OpenSourceLicensesPage;
