import { styled } from '@mui/material/styles';
import Typography, { TypographyProps } from '@mui/material/Typography';

const MaxLinesTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'maxLines',
})<TypographyProps & { maxLines: number }>(({ maxLines }) => ({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: maxLines,
  WebkitBoxOrient: 'vertical',
}));

export default MaxLinesTypography;
