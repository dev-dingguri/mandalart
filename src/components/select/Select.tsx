import Button from 'components/button/Button';
import Menu from 'components/menu/Menu';
import React, { useRef, useState } from 'react';
import { BsFillCaretDownFill } from 'react-icons/bs';
import styles from './Select.module.css';

type SelectOption = {
  value: string;
  name: string;
};

type SelectProps = {
  className?: string;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

const Select = ({
  className,
  options,
  selectedValue,
  onSelect,
}: SelectProps) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const [isShownMenu, setIsShownMenu] = useState(false);
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);

  const showMenu = () => {
    const select = selectRef.current;
    if (select) {
      setMenuY(select.offsetTop + select.offsetHeight + 3);
      setMenuX(select.offsetLeft);
    }
    setIsShownMenu(true);
  };
  const hideMenu = () => setIsShownMenu(false);

  const selectedName = (() => {
    const selectedOption = options.find(
      (option) => option.value === selectedValue
    );
    if (selectedOption) {
      return selectedOption.name;
    }
    throw new Error('no matching options');
  })();

  return (
    <div ref={selectRef} className={className}>
      <Button className={styles.button} onClick={showMenu}>
        <p>{selectedName}</p>
        <BsFillCaretDownFill />
      </Button>
      <Menu
        isShown={isShownMenu}
        yPos={menuY}
        xPos={menuX}
        options={options}
        onSelect={onSelect}
        onClose={hideMenu}
      />
    </div>
  );
};

export default Select;
