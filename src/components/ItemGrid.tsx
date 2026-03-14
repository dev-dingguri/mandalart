import { cn } from 'lib/utils';

type ItemGridProps = {
  rowSize: number;
  colSize: number;
  createItem: (idx: number, row: number, col: number) => React.JSX.Element;
  spacing?: string | number;
} & React.HTMLAttributes<HTMLDivElement>;

const ItemGrid = ({
  rowSize,
  colSize,
  createItem,
  spacing,
  className,
  ...rest
}: ItemGridProps) => {
  return (
    <div className={className} {...rest}>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${colSize}, 1fr)`,
          gap: spacing,
        }}
      >
        {Array.from({ length: rowSize }, (_, row) =>
          Array.from({ length: colSize }, (_, col) => (
            <div key={row * colSize + col}>
              {createItem(row * rowSize + col, row, col)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ItemGrid;
