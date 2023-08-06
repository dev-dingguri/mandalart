import Modal, { ModalProps } from '@mui/material/Modal';
import useVisualViewportSize from 'hooks/useVisualViewportSize';
import { styled } from '@mui/material/styles';

const CenterModal = styled(Modal)<ModalProps>(() => {
  const { width, height } = useVisualViewportSize();
  return {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width,
    height,
  };
});

export default CenterModal;
