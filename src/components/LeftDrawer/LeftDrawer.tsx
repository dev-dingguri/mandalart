import React from 'react';
import styles from './LeftDrawer.module.css';
import { BsPlus } from 'react-icons/bs';
import Button from '@mui/material/Button';
import MandalartList from 'components/MandalartList/MandalartList';
import { Snippet } from 'types/Snippet';
import { useTranslation } from 'react-i18next';
import { Drawer } from '@mui/material';

type LeftDrawerProps = {
  isShown: boolean;
  snippetMap: Map<string, Snippet>;
  selectedMandalartId: string | null;
  onSelectMandalart: (mandalartId: string) => void;
  onDeleteMandalart: (mandalartId: string) => void;
  onRenameMandalart: (mandalartId: string, name: string) => void;
  onResetMandalart: (mandalartId: string) => void;
  onCreateMandalart: () => void;
  onClose: () => void;
};

const LeftDrawer = ({
  isShown,
  snippetMap,
  selectedMandalartId,
  onSelectMandalart,
  onDeleteMandalart,
  onRenameMandalart,
  onResetMandalart,
  onCreateMandalart,
  onClose,
}: LeftDrawerProps) => {
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
    <Drawer anchor="left" open={isShown} onClose={onClose}>
      <div className={`${styles.aside}`}>
        <MandalartList
          snippetMap={snippetMap}
          selectedId={selectedMandalartId}
          onSelect={handleSelectMandalart}
          onDelete={onDeleteMandalart}
          onRename={onRenameMandalart}
          onReset={onResetMandalart}
        />
        <div className={styles.bottom}>
          {/* todo: 버튼 내부 좌측 정렬*/}
          <Button className={styles.newButton} onClick={handleNewClick}>
            <BsPlus />
            {t('mandalart.new')}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default LeftDrawer;
