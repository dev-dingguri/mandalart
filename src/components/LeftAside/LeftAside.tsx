import React from 'react';
import styles from './LeftAside.module.css';
import { BsPlus } from 'react-icons/bs';
import Button from 'components/Button/Button';
import MandalartList from 'components/MandalartList/MandalartList';
import OutsideClickDetector from 'components/OutsideClickDetector/OutsideClickDetector';
import { Snippet } from 'types/Snippet';

type LeftAsideProps = {
  isShown: boolean;
  snippetMap: Map<string, Snippet>;
  selectedMandalartId: string | null;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onNewMandalart: () => void;
  onClose: () => void;
};

const LeftAside = ({
  isShown,
  snippetMap,
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
          snippetMap={snippetMap}
          selectedId={selectedMandalartId}
          onSelect={handleSelectMandalart}
          onDelete={onDeleteMandalart}
          onRename={onRenameMandalart}
        />
        <div className={styles.bottom}>
          <Button className={styles.newButton} onClick={handleNewClick}>
            <BsPlus />
            <p>New</p>
          </Button>
        </div>
      </div>
    </OutsideClickDetector>
  );
};

export default LeftAside;
