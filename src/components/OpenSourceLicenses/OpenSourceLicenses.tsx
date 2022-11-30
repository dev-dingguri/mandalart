import { useEffect, useState } from 'react';
import licenseDataFile from 'assets/json/packageLicenses.json';
import { BsChevronLeft } from 'react-icons/bs';
import styles from './OpenSourceLicenses.module.css';
import Button from 'components/Button/Button';
import { useLocation, useNavigate } from 'react-router-dom';

/*
 * licenseDataFile
 * Created with 'license-checker --production -excludePrivatePackages --customPath [customPath.json] --json'
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

type LicenseDatum = {
  name: string;
  licenses: string;
  repository: string;
};

type LicenseData = {
  [packageName: string]: LicenseDatum;
};

const Item = ({ name, licenses, repository }: LicenseDatum) => {
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

const parseLicenseData = (licenseData: LicenseData) => {
  return Object.keys(licenseData).map((key) => licenseData[key]);
};

const OpenSourceLicenses = () => {
  const [licenseData, setLicenseData] = useState<LicenseDatum[]>([]);
  useEffect(() => {
    setLicenseData(parseLicenseData(licenseDataFile));
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const goToBack = () => {
    if (location.key === 'default') {
      navigate('/mandalart');
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
        <h1 className={styles.title}>Open Source Licenses</h1>
      </header>
      <ul className={styles.list}>
        {licenseData.map((datum, idx) => (
          <Item key={idx} {...datum} />
        ))}
      </ul>
    </section>
  );
};

export default OpenSourceLicenses;
