import React from 'react';
import styles from './LeftAside.module.css';
import { BsPlus } from 'react-icons/bs';
import Button from 'components/Button/Button';
import MandalartList from 'components/MandalartList/MandalartList';
import OutsideClickDetector from 'components/OutsideClickDetector/OutsideClickDetector';
import { Snippet } from 'types/Snippet';
import { useTranslation } from 'react-i18next';

type LeftAsideProps = {
  isShown: boolean;
  snippetMap: Map<string, Snippet> | null;
  selectedMandalartId: string | null;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onResetMandalart: (mandalartId: string) => void;
  onCreateMandalart: () => void;
  onClose: () => void;
};

const LeftAside = ({
  isShown,
  snippetMap,
  selectedMandalartId,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onResetMandalart,
  onCreateMandalart,
  onClose,
}: LeftAsideProps) => {
  const { t } = useTranslation();

  const handleSelectMandalart = (mandalartId: string) => {
    onSelectMandalart(mandalartId);
    onClose();
  };

  const handleNewClick = () => {
    onCreateMandalart();
    onClose();
  };

  return (
    <OutsideClickDetector
      className={`${styles.container} ${isShown && styles.shown}`}
      onOutsideLClick={onClose}
    >
      <div className={`${styles.aside} ${isShown && styles.shown}`}>
        <MandalartList
          snippetMap={snippetMap}
          selectedId={selectedMandalartId}
          onSelect={handleSelectMandalart}
          onDelete={onDeleteMandalart}
          onRename={onRenameMandalart}
          onReset={onResetMandalart}
        />
        <div className={styles.bottom}>
          <Button className={styles.newButton} onClick={handleNewClick}>
            <BsPlus />
            <p>{t('mandalart.new')}</p>
          </Button>
        </div>
      </div>
    </OutsideClickDetector>
  );
};

export default LeftAside;
