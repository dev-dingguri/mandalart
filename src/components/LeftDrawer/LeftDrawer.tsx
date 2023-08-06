import React from 'react';
import { BsPlus } from 'react-icons/bs';
import Button from '@mui/material/Button';
import MandalartList from 'components/MandalartList/MandalartList';
import { Snippet } from 'types/Snippet';
import { useTranslation } from 'react-i18next';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

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
    <Drawer
      anchor="left"
      open={isShown}
      onClose={onClose}
      sx={{
        '&& .MuiPaper-root': {
          width: '70vw',
          '@media screen and (min-width: 30rem)': {
            width: '21rem',
          },
        },
      }}
    >
      <MandalartList
        snippetMap={snippetMap}
        selectedId={selectedMandalartId}
        onItemSelect={handleSelectMandalart}
        onItemDelete={onDeleteMandalart}
        onItemRename={onRenameMandalart}
        onItemReset={onResetMandalart}
        sx={{
          p: '0.5em',
          pt: '1em',
          overflow: 'auto',
          scrollbarGutter: 'stable both-edges',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: '0 var(--size-scrollbar-width)',
        }}
      >
        <Divider variant="middle" />
        <Button
          startIcon={<BsPlus />}
          sx={{
            m: '0.5em',
            p: '0.5em 1em',
            justifyContent: 'flex-start',
            backgroundColor: (theme) => theme.palette.primary.dark,
          }}
          onClick={handleNewClick}
          size="large"
        >
          {t('mandalart.new')}
        </Button>
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
