import Grid from '@mui/material/Unstable_Grid2';
import Box, { BoxProps } from '@mui/material/Box';

type ItemGridProps = {
  rowSize: number;
  colSize: number;
  createItem: (idx: number, row: number, col: number) => JSX.Element;
  spacing?: string | number;
} & BoxProps;

const ItemGrid = ({
  rowSize,
  colSize,
  createItem,
  spacing,
  ...rest
}: ItemGridProps) => {
  return (
    <Box {...rest}>
      <Grid container spacing={{ xs: spacing }} columns={{ xs: colSize }}>
        {Array.from({ length: rowSize }).map((_, row) =>
          Array.from({ length: colSize }).map((_, col) => (
            <Grid xs={1}>{createItem(row * rowSize + col, row, col)}</Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default ItemGrid;
