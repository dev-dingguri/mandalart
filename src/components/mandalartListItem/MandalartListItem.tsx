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
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);

  const handleShowMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenuY(ev.pageY);
    setMenuX(ev.pageX);
    setShownMenu(true);
  };
  const handleCloseMenu = () => {
    setShownMenu(false);
  };

  const handleShowEditor = () => setIsShownEditor(true);
  const handleCloseEditor = () => setIsShownEditor(false);

  const handleMenuSelect = (value: string) => {
    if (value === 'delete') {
      onDelete();
    } else if (value === 'rename') {
      handleShowEditor();
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
      <p>{metadata.title}</p>
      <Button className={styles.etcButton} onClick={handleShowMenu}>
        <BsThreeDots />
      </Button>
      <Menu
        isShown={isShownMenu}
        yPos={menuY}
        xPos={menuX}
        options={menuOptions}
        onSelect={handleMenuSelect}
        onClose={handleCloseMenu}
      />
      <TextEditor
        isShown={isShownEditor}
        value={metadata.title}
        onClose={handleCloseEditor}
        onEnter={(name) => {
          onRename(name);
          handleCloseEditor();
        }}
      />
    </li>
  );
};

export default MandalartListItem;
