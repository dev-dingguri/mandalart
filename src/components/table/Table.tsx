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

  const table: JSX.Element[] = [];
  for (let row = 0; row < rowSize; ++row) {
    const rows: JSX.Element[] = [];
    for (let col = 0; col < colSize; ++col) {
      const idx = row * rowSize + col;
      rows.push(
        <div key={idx} className={styles.item}>
          {itemGenerator(idx)}
        </div>
      );
    }
    table.push(
      <div key={row} className={styles.row}>
        {rows}
      </div>
    );
  }
  return (
    <div ref={ref} className={styles.table}>
      {table}
    </div>
  );
};

export default Table;
