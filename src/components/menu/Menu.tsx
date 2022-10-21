import React from 'react';
import styles from './Menu.module.css';
import OutsideClickDetector from 'components/outsideClickDetector/OutsideClickDetector';

type MenuOption = {
  value: string;
  name: string;
};

type MenuProps = {
  isShown: boolean;
  xPos: number;
  yPos: number;
  options: MenuOption[];
  onSelect: (value: string) => void;
  onClose: () => void;
};

const Menu = ({
  isShown,
  xPos,
  yPos,
  options,
  onSelect,
  onClose,
}: MenuProps) => {
  const handleItemClick = (ev: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    onClose();

    const value = ev.currentTarget.dataset.value;
    if (value) {
      onSelect(value);
    } else {
      throw new Error('no value');
    }
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
        style={{ left: xPos, top: yPos }}
        onClick={stopClickPropagation}
        onContextMenu={stopClickPropagation}
      >
        {options.map((option) => (
          <li
            key={option.value}
            data-value={option.value}
            onClick={handleItemClick}
          >
            {option.name}
          </li>
        ))}
      </ul>
    </OutsideClickDetector>
  ) : null;
};

export default Menu;
