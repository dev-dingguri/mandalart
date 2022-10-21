import React, { useState } from 'react';
import { MandalartMetadata } from 'types/MandalartMetadata';
import Button from 'components/button/Button';
import { BsGrid3X3, BsThreeDots } from 'react-icons/bs';
import styles from './MandalartListItem.module.css';
import Menu, { MenuProps } from 'components/menu/Menu';
import TextEditor from 'components/textEditor/TextEditor';

type ItemMenuProps = Omit<MenuProps, 'children'> & {
  onDelete: () => void;
  onRename: () => void;
};

const ItemMenu = ({
  onDelete,
  onRename,
  ...contextMenuProps
}: ItemMenuProps) => {
  const onClose = contextMenuProps.onClose;

  const handleMenuClick = (ev: React.MouseEvent<Element, MouseEvent>) =>
    ev.stopPropagation();

  const handleDelete = (ev: React.MouseEvent<Element, MouseEvent>) => {
    onDelete();
    onClose(ev);
  };
  const handleRename = (ev: React.MouseEvent<Element, MouseEvent>) => {
    onRename();
    onClose(ev);
  };

  return (
    <Menu {...contextMenuProps}>
      <ul
        className={styles.menu}
        onClick={handleMenuClick}
        onContextMenu={handleMenuClick}
      >
        <li onClick={handleDelete}>Delete</li>
        <li onClick={handleRename}>Rename</li>
      </ul>
    </Menu>
  );
};

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
  const [menuLeft, setMenuLeft] = useState(0);
  const [menuTop, setMenuTop] = useState(0);

  const showMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.preventDefault();
    ev.stopPropagation();
    setMenuLeft(ev.pageX);
    setMenuTop(ev.pageY);
    setShownMenu(true);
  };
  const hideMenu = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.stopPropagation();
    setShownMenu(false);
  };

  const showEditor = () => setIsShownEditor(true);
  const hideEditor = () => setIsShownEditor(false);

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
      <ItemMenu
        isShown={isShownMenu}
        left={menuLeft}
        top={menuTop}
        onClose={hideMenu}
        onDelete={onDelete}
        onRename={showEditor}
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
