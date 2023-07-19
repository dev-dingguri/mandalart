import Box from '@mui/material/Box';
import { styled } from '@mui/system';

const CenterBox = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export default CenterBox;
