import React from 'react';
import styles from './LeftAside.module.css';
import { BsPlus } from 'react-icons/bs';
import Button from 'components/button/Button';
import MandalartList from 'components/mandalartList/MandalartList';
import OutsideClickDetector from 'components/outsideClickDetector/OutsideClickDetector';
import { MandalartMetadata } from 'types/MandalartMetadata';

type LeftAsideProps = {
  isShown: boolean;
  mandalartMetadataMap: Map<string, MandalartMetadata>;
  selectedMandalartId: string;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onNewMandalart: () => void;
  onClose: () => void;
};

const LeftAside = ({
  isShown,
  mandalartMetadataMap: metadataMap,
  selectedMandalartId,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onNewMandalart,
  onClose,
}: LeftAsideProps) => {
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
        <MandalartList
          metadataMap={metadataMap}
          selectedId={selectedMandalartId}
          onSelect={handleSelectMandalart}
          onDelete={onDeleteMandalart}
          onRename={onRenameMandalart}
        />
        <Button className={styles.newButton} onClick={handleNewClick}>
          <BsPlus />
          <p>New</p>
        </Button>
      </div>
    </OutsideClickDetector>
  );
};

export default LeftAside;
