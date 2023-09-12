import React from 'react';
import { BsPlus } from 'react-icons/bs';
import Button from '@mui/material/Button';
import MandalartList from 'components/MandalartList';
import { Snippet } from 'types/Snippet';
import { useTranslation } from 'react-i18next';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

type LeftDrawerProps = {
  isOpen: boolean;
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
  isOpen,
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

  return (
    <Drawer
      anchor="left"
      open={isOpen}
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
        onItemSelect={onSelectMandalart}
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
          onClick={onCreateMandalart}
          size="large"
        >
          {t('mandalart.new')}
        </Button>
      </Box>
    </Drawer>
  );
};

export default LeftDrawer;
