import React, { useState } from 'react';
import { MandalartMetadata } from 'types/MandalartMetadata';
import Button from 'components/button/Button';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import styles from './MandalartListItem.module.css';
import Menu from 'components/menu/Menu';
import TextEditor from 'components/textEditor/TextEditor';

type MandalartListItemProps = {
  metadata: MandalartMetadata;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
};

const MandalartListItem = ({
  metadata,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: MandalartListItemProps) => {
  const [isShownMenu, setShownMenu] = useState(false);
  const [isShownEditor, setIsShownEditor] = useState(false);
  const [menuX, setMenuX] = useState(0);
  const [menuY, setMenuY] = useState(0);

  const showMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenuX(ev.pageX);
    setMenuY(ev.pageY);
    setShownMenu(true);
  };
  const hideMenu = () => {
    setShownMenu(false);
  };

  const showEditor = () => setIsShownEditor(true);
  const hideEditor = () => setIsShownEditor(false);

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
      onContextMenu={showMenu}
    >
      <BsGrid3X3 className={styles.icon} />
      <p>{metadata.title}</p>
      <Button className={styles.etcButton} onClick={showMenu}>
        <BsThreeDots />
      </Button>
      <Menu
        isShown={isShownMenu}
        xPos={menuX}
        yPos={menuY}
        options={menuOptions}
        onSelect={handleMenuSelect}
        onClose={hideMenu}
      />
      <TextEditor
        isShown={isShownEditor}
        value={metadata.title}
        onClose={hideEditor}
        onEnter={(name) => {
          onRename(name);
          hideEditor();
        }}
      />
    </li>
  );
};

export default MandalartListItem;
