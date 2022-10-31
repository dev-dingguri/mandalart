import { useLayoutEffect, useRef } from 'react';
import styles from './Table.module.css';

type TableProps = {
  rowSize: number;
  colSize: number;
  itemGenerator: (idx: number) => JSX.Element;
  space?: string;
};

const Table = ({
  rowSize,
  colSize,
  itemGenerator,
  space = '0',
}: TableProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const table = ref.current!;
    table.style.setProperty('--space', `${space}`);
  }, [space]);

  const table = Array.from({ length: rowSize }, (_, row) => {
    const rows = Array.from({ length: colSize }, (_, col) => {
      const idx = row * rowSize + col;
      return (
        <div key={idx} className={styles.item}>
          {itemGenerator(idx)}
        </div>
      );
    });
    return (
      <div key={row} className={styles.row}>
        {rows}
      </div>
    );
  });

  return (
    <div ref={ref} className={styles.table}>
      {table}
    </div>
  );
};

export default Table;
