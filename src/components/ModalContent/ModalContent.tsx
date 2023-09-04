import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const ModalContent = styled(Box)<BoxProps>(({ theme }) => ({
  backgroundColor: theme.palette?.background.default,
  boxShadow: theme.shadows[13],
  padding: '2em',
  border: '0',
  borderRadius: '8px',
}));

export default ModalContent;
