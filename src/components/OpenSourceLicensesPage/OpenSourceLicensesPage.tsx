import { useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import styles from './OpenSourceLicensesPage.module.css';
import IconButton from '@mui/material/IconButton';
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
    <li className={styles.item}>
      <h3>{name}</h3>
      <p>{licenses}</p>
      <p>
        <a href={repository} target="blank">
          {repository}
        </a>
      </p>
    </li>
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
        <h1 className={styles.title}>{t('oss.label')}</h1>
      </header>
      <ul className={styles.list}>
        {licenses.map((data, idx) => (
          <Item key={idx} {...data} />
        ))}
      </ul>
    </section>
  );
};

const mapToArray = (licenseMap: { [key: string]: License }) => {
  return Object.keys(licenseMap).map((key) => licenseMap[key]);
};

export default OpenSourceLicensesPage;
