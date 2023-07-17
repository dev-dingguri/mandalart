import React from 'react';
import styles from './MandalartViewToggle.module.css';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { BsGrid3X3 } from 'react-icons/bs';

type MandalartViewToggleProps = {
  isAllView: boolean;
  onChange: (isAllView: boolean) => void;
};

const MandalartViewToggle = ({
  isAllView,
  onChange,
}: MandalartViewToggleProps) => {
  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    value: boolean | null
  ) => value !== null && onChange(value);

  return (
    <ToggleButtonGroup
      className={styles.toggleButtonGroup}
      color="primary"
      value={isAllView}
      exclusive
      onChange={handleChange}
      aria-label="mandalart view type"
    >
      <ToggleButton className={styles.toggleButton} value={true}>
        <BsGrid3X3 className={styles.allViewIcon} />
      </ToggleButton>
      <ToggleButton className={styles.toggleButton} value={false}>
        <div className={styles.partViewIconFrame}>
          <BsGrid3X3 className={styles.partViewIcon} />
        </div>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default MandalartViewToggle;
