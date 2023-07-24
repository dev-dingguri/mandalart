import { useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import styles from './OpenSourceLicensesPage.module.css';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH_MAIN } from 'constants/constants';
import licenseMap from 'assets/data/openSourceLicenses.json';

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
    <ListItem className={styles.item}>
      <Typography variant="subtitle1">{name}</Typography>
      <Typography variant="body2">{licenses}</Typography>
      <a href={repository} target="blank">
        <Typography variant="body2">{repository}</Typography>
      </a>
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
    <section className={styles.license}>
      <header className={styles.header}>
        <IconButton className={styles.goBackButton} onClick={goToBack}>
          <BsChevronLeft />
        </IconButton>
        <Typography variant="h1">{t('oss.label')}</Typography>
      </header>
      <List className={styles.list}>
        {licenses.map((data, idx) => (
          <Item key={idx} {...data} />
        ))}
      </List>
    </section>
  );
};

const mapToArray = (licenseMap: { [key: string]: License }) => {
  return Object.keys(licenseMap).map((key) => licenseMap[key]);
};

export default OpenSourceLicensesPage;
