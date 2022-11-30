import Button from 'components/Button/Button';
import Menu from 'components/Menu/Menu';
import useBoolean from 'hooks/useBoolean';
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
  const ref = useRef<HTMLDivElement>(null);
  const [isShownMenu, { on: showMenu, off: closeMenu }] = useBoolean(false);
  const [menuY, setMenuY] = useState(0);
  const [menuX, setMenuX] = useState(0);

  const handleShowMenu = () => {
    const select = ref.current;
    if (select) {
      const rect = select.getBoundingClientRect();
      setMenuY(rect.top + rect.height + 3);
      setMenuX(rect.left);
    }
    showMenu();
  };

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
    <div ref={ref} className={className}>
      <Button className={styles.button} onClick={handleShowMenu}>
        <p>{selectedName}</p>
        <BsFillCaretDownFill />
      </Button>
      <Menu
        isShown={isShownMenu}
        yPos={menuY}
        xPos={menuX}
        options={options}
        onSelect={onSelect}
        onClose={closeMenu}
      />
    </div>
  );
};

export default Select;
