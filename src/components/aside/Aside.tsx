import React from 'react';
import styles from './Aside.module.css';
import { BsChevronDoubleLeft, BsPlus } from 'react-icons/bs';
import Button from 'components/button/Button';
import MandalartList from 'components/mandalartList/MandalartList';
import OutsideClickDetector from 'components/outsideClickDetector/OutsideClickDetector';
import { MandalartMetadata } from 'types/MandalartMetadata';

type AsideProps = {
  isShown: boolean;
  mandalartMetadataMap: Map<string, MandalartMetadata>;
  selectedMandalartId: string;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onNewMandalart: () => void;
  onClose: () => void;
};

const Aside = ({
  isShown,
  mandalartMetadataMap: metadataMap,
  selectedMandalartId,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onNewMandalart,
  onClose,
}: AsideProps) => {
  const handleSelectMandalart = (mandalartId: string) => {
    onSelectMandalart(mandalartId);
    onClose();
  };

  const handleNewClick = () => {
    onNewMandalart();
    onClose();
  };

  return (
    <OutsideClickDetector
      className={`${styles.container} ${isShown && styles.shown}`}
      onOutsideLClick={onClose}
    >
      <div className={`${styles.aside} ${isShown && styles.shown}`}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mandalart</h1>
          <Button className={styles.closeButton} onClick={onClose}>
            <BsChevronDoubleLeft />
          </Button>
        </header>
        <MandalartList
          metadataMap={metadataMap}
          selectedId={selectedMandalartId}
          onSelect={handleSelectMandalart}
          onDelete={onDeleteMandalart}
          onRename={onRenameMandalart}
        />
        <Button className={styles.newButton} onClick={handleNewClick}>
          <BsPlus />
          <p>new</p>
        </Button>
      </div>
    </OutsideClickDetector>
  );
};

export default Aside;
