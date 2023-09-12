import React, { useState } from 'react';
import { Snippet } from 'types/Snippet';
import IconButton from '@mui/material/IconButton';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextEditor from 'components/TextEditor';
import {
  MAX_MANDALART_TITLE_SIZE,
  TMP_MANDALART_ID,
} from 'constants/constants';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'usehooks-ts';

type MandalartListItemProps = {
  mandalartId: string;
  snippet: Snippet;
  isSelected: boolean;
  onSelect: (mandalartId: string) => void;
  onDelete: (mandalartId: string) => void;
  onReset: (mandalartId: string) => void;
  onRename: (mandalartId: string, name: string) => void;
};

const MandalartListItem = ({
  mandalartId,
  snippet,
  isSelected,
  onSelect,
  onDelete,
  onReset,
  onRename,
}: MandalartListItemProps) => {
  const {
    value: isOpenEditor,
    setTrue: openEditor,
    setFalse: closeEditor,
  } = useBoolean(false);
  const {
    value: isOpenMenu,
    setTrue: openMenu,
    setFalse: closeMenu,
  } = useBoolean(false);
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);
  const { t } = useTranslation();

  const handleOpenMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    setMenuY(ev.pageY);
    setMenuX(ev.pageX);
    openMenu();
  };

  return (
    <>
      <ListItemButton
        selected={isSelected}
        onClick={() => onSelect(mandalartId)}
        onContextMenu={handleOpenMenu}
      >
        <ListItemIcon>
          <BsGrid3X3 />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" noWrap>
              {snippet.title ? snippet.title : t('mandalart.snippet.untitled')}
            </Typography>
          }
        />
        <IconButton
          size="small"
          onClick={(ev) => {
            ev.stopPropagation(); // 만다라트 리스트 항목이 선택되는 것 방지
            handleOpenMenu(ev);
          }}
        >
          <BsThreeDots />
        </IconButton>
      </ListItemButton>
      <Menu
        open={isOpenMenu}
        onClick={closeMenu}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={isOpenMenu ? { top: menuY, left: menuX } : undefined}
      >
        {mandalartId !== TMP_MANDALART_ID && (
          <MenuItem onClick={() => onDelete(mandalartId)}>
            {t('mandalart.delete')}
          </MenuItem>
        )}
        <MenuItem onClick={() => onReset(mandalartId)}>
          {t('mandalart.reset')}
        </MenuItem>
        <MenuItem onClick={openEditor}>{t('mandalart.rename')}</MenuItem>
      </Menu>
      <TextEditor
        isOpen={isOpenEditor}
        initialText={snippet.title}
        textLimit={MAX_MANDALART_TITLE_SIZE}
        onClose={closeEditor}
        onConfirm={(name) => {
          onRename(mandalartId, name);
        }}
      />
    </>
  );
};

export default MandalartListItem;
