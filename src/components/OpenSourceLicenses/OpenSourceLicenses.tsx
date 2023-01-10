import { useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import styles from './OpenSourceLicenses.module.css';
import Button from 'components/Button/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PATH_HOME } from 'constants/constants';
import licenseMap from 'assets/json/openSourceLicenses.json';

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

const OpenSourceLicenses = () => {
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
      navigate(`/${lang}${PATH_HOME}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <section className={styles.license}>
      <header className={styles.header}>
        <Button className={styles.goBackButton} onClick={goToBack}>
          <BsChevronLeft />
        </Button>
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

export default OpenSourceLicenses;
