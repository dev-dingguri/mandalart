import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';

// https://stackoverflow.com/a/28985475

const SquareBox = styled(Box)({
  position: 'relative',
  width: '100%',
  '&::before': {
    display: 'block',
    content: "''",
    paddingTop: '100%',
  },
});

const SquareContents = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});

const Square = ({ children }: PropsWithChildren) => {
  return (
    <SquareBox>
      <SquareContents>{children}</SquareContents>
    </SquareBox>
  );
};

export default Square;
