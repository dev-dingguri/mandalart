import React, { useState } from 'react';
import { Snippet } from 'types/Snippet';
import IconButton from '@mui/material/IconButton';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import styles from './MandalartListItem.module.css';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextEditor from 'components/TextEditor/TextEditor';
import useBoolean from 'hooks/useBoolean';
import { TMP_MANDALART_ID } from 'constants/constants';
import { useTranslation } from 'react-i18next';

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
  const [isShownMenu, { on: showMenu, off: closeMenu }] = useBoolean(false);
  const [isShownEditor, { on: showEditor, off: closeEditor }] =
    useBoolean(false);
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);
  const { t } = useTranslation();

  const handleShowMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenuY(ev.pageY);
    setMenuX(ev.pageX);
    showMenu();
  };

  const handleMenuClick = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.stopPropagation(); // 메뉴 클릭시 Drawer 닫힘 방지
    closeMenu();
  };

  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => onSelect(mandalartId)}
      onContextMenu={handleShowMenu}
    >
      <ListItemIcon>
        <BsGrid3X3 className={styles.icon} />
      </ListItemIcon>
      <ListItemText
        primary={
          snippet.title ? snippet.title : t('mandalart.snippet.untitled')
        }
      />
      <IconButton
        className={styles.etcButton}
        size="small"
        onClick={handleShowMenu}
      >
        <BsThreeDots />
      </IconButton>
      <Menu
        open={isShownMenu}
        onClick={handleMenuClick}
        onClose={closeMenu}
        anchorReference="anchorPosition"
        anchorPosition={isShownMenu ? { top: menuY, left: menuX } : undefined}
      >
        {mandalartId !== TMP_MANDALART_ID && (
          <MenuItem onClick={() => onDelete(mandalartId)}>
            {t('mandalart.delete')}
          </MenuItem>
        )}
        <MenuItem onClick={() => onReset(mandalartId)}>
          {t('mandalart.reset')}
        </MenuItem>
        <MenuItem onClick={showEditor}>{t('mandalart.rename')}</MenuItem>
      </Menu>
      {/* todo: 만다라트 제목 편집 후 Drawer 닫힘 방지 검토 */}
      <TextEditor
        isShown={isShownEditor}
        initialText={snippet.title}
        onClose={closeEditor}
        onConfirm={(name) => {
          onRename(mandalartId, name);
        }}
      />
    </ListItemButton>
  );
};

export default MandalartListItem;
