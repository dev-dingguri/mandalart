import React from 'react';
import styles from './Menu.module.css';
import OutsideClickDetector from 'components/OutsideClickDetector/OutsideClickDetector';

type MenuOption = {
  value: string;
  name: string;
};

type MenuProps = {
  isShown: boolean;
  yPos: number;
  xPos: number;
  options: MenuOption[];
  onSelect: (value: string) => void;
  onClose: () => void;
};

const Menu = ({
  isShown,
  yPos,
  xPos,
  options,
  onSelect,
  onClose,
}: MenuProps) => {
  const handleSelect = (ev: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const value = ev.currentTarget.dataset.value;
    if (value) {
      onSelect(value);
    } else {
      throw new Error('Menu option is null.');
    }
    onClose();
  };

  const stopClickPropagation = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.stopPropagation();
  };

  const handleClose = (ev: React.MouseEvent<Element, MouseEvent>) => {
    ev.stopPropagation();
    onClose();
  };

  return isShown ? (
    <OutsideClickDetector
      onOutsideLClick={handleClose}
      onOutsideRClick={handleClose}
    >
      <ul
        className={styles.menu}
        style={{ top: yPos, left: xPos }}
        onClick={stopClickPropagation}
        onContextMenu={stopClickPropagation}
      >
        {options.map((option) => (
          <li
            key={option.value}
            data-value={option.value}
            onClick={handleSelect}
          >
            {option.name}
          </li>
        ))}
      </ul>
    </OutsideClickDetector>
  ) : null;
};

export default Menu;
