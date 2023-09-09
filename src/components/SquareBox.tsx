import Box, { BoxProps } from '@mui/material/Box';

// https://stackoverflow.com/a/28985475

const SquareBox = ({ sx, ...rest }: BoxProps) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        '&::before': {
          display: 'block',
          content: "''",
          paddingTop: '100%',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          ...sx,
        }}
        {...rest}
      />
    </Box>
  );
};

export default SquareBox;
