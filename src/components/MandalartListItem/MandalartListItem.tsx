import React, { useState } from 'react';
import { Snippet } from 'types/Snippet';
import Button from 'components/Button/Button';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import styles from './MandalartListItem.module.css';
import Menu from 'components/Menu/Menu';
import TextEditor from 'components/TextEditor/TextEditor';
import useBoolean from 'hooks/useBoolean';
import { TMP_MANDALART_ID } from 'constants/constants';
import { useMemo } from 'react';
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

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case 'delete':
        return onDelete(mandalartId);
      case 'reset':
        return onReset(mandalartId);
      case 'rename':
        return showEditor();
      default:
        throw new Error(`Not supported menu option. option=${value}`);
    }
  };

  const options = useMemo(() => {
    const options: { value: string; name: string }[] = [];
    if (mandalartId !== TMP_MANDALART_ID) {
      options.push({ value: 'delete', name: t('mandalart.delete') });
    }
    options.push({ value: 'reset', name: t('mandalart.reset') });
    options.push({ value: 'rename', name: t('mandalart.rename') });
    return options;
  }, [mandalartId]);

  return (
    <li
      className={`${styles.item} ${isSelected && styles.selected}`}
      onClick={() => onSelect(mandalartId)}
      onContextMenu={handleShowMenu}
    >
      <BsGrid3X3 className={styles.icon} />
      <p>{snippet.title}</p>
      <Button className={styles.etcButton} onClick={handleShowMenu}>
        <BsThreeDots />
      </Button>
      <Menu
        isShown={isShownMenu}
        yPos={menuY}
        xPos={menuX}
        options={options}
        onSelect={handleMenuSelect}
        onClose={closeMenu}
      />
      <TextEditor
        isShown={isShownEditor}
        initialText={snippet.title}
        onClose={closeEditor}
        onConfirm={(name) => {
          onRename(mandalartId, name);
        }}
      />
    </li>
  );
};

export default MandalartListItem;
