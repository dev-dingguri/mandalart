import React, { useState } from 'react';
import { Snippet } from 'types/Snippet';
import Button from 'components/Button/Button';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import styles from './MandalartListItem.module.css';
import Menu from 'components/Menu/Menu';
import TextEditor from 'components/TextEditor/TextEditor';
import useBoolean from 'hooks/useBoolean';

type MandalartListItemProps = {
  snippet: Snippet;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
};

const MandalartListItem = ({
  snippet,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: MandalartListItemProps) => {
  const [isShownMenu, { on: showMenu, off: closeMenu }] = useBoolean(false);
  const [isShownEditor, { on: showEditor, off: closeEditor }] =
    useBoolean(false);
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);

  const handleShowMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenuY(ev.pageY);
    setMenuX(ev.pageX);
    showMenu();
  };

  const handleMenuSelect = (value: string) => {
    if (value === 'delete') {
      onDelete();
    } else if (value === 'rename') {
      showEditor();
    } else {
      throw new Error('not support value');
    }
  };

  const menuOptions = [
    { value: 'delete', name: 'Delete' },
    { value: 'rename', name: 'Rename' },
  ];

  return (
    <li
      className={`${styles.item} ${isSelected && styles.selected}`}
      onClick={onSelect}
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
        options={menuOptions}
        onSelect={handleMenuSelect}
        onClose={closeMenu}
      />
      <TextEditor
        isShown={isShownEditor}
        value={snippet.title}
        onClose={closeEditor}
        onEnter={(name) => {
          onRename(name);
          closeEditor();
        }}
      />
    </li>
  );
};

export default MandalartListItem;
