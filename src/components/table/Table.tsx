import styles from './Table.module.css';

type TableProps = {
  rowSize: number;
  colSize: number;
  itemGenerator: (idx: number) => JSX.Element;
};

const Table = ({ rowSize, colSize, itemGenerator }: TableProps) => {
  const table: JSX.Element[] = [];
  for (let row = 0; row < rowSize; ++row) {
    const rows: JSX.Element[] = [];
    for (let col = 0; col < colSize; ++col) {
      const idx = row * rowSize + col;
      rows.push(itemGenerator(idx));
    }
    table.push(
      <div key={row} className={styles.row}>
        {rows}
      </div>
    );
  }
  return <div className={styles.table}>{table}</div>;
};

export default Table;
