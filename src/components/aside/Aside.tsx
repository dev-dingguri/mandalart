import React from 'react';
import styles from './Aside.module.css';
import { BsChevronDoubleLeft, BsPlus } from 'react-icons/bs';
import Button from '../button/Button';
import { MandalartMetadata } from '../../type/MandalartMetadata';
import MandalartList from '../mandalartList/MandalartList';
import ClickOutsideDetector from '../clickOutsideDetector/ClickOutsideDetector';

type AsideProps = {
  isShow: boolean;
  mandalartMetadataMap: Map<string, MandalartMetadata>;
  selectedMandalartId: string;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onNewMandalart: () => void;
  onClose: () => void;
};

const Aside = ({
  isShow,
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
    <ClickOutsideDetector
      className={`${styles.container} ${isShow && styles.show}`}
      onClickOutside={onClose}
    >
      <div className={`${styles.aside} ${isShow && styles.show}`}>
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
    </ClickOutsideDetector>
  );
};

export default Aside;
