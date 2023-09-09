import React from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { BsGrid3X3 } from 'react-icons/bs';

type MandalartViewToggleProps = {
  isAllView: boolean;
  onChange: (isAllView: boolean) => void;
};

const MandalartViewToggle = ({
  isAllView,
  onChange,
}: MandalartViewToggleProps) => {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    value: boolean | null
  ) => value !== null && onChange(value);

  return (
    <ToggleButtonGroup
      sx={{ display: 'flex' }}
      color="secondary"
      value={isAllView}
      exclusive
      onChange={handleChange}
      aria-label="mandalart view type"
    >
      <ToggleButton sx={{ flex: 1 }} value={true}>
        <BsGrid3X3 style={{ fontSize: '1.5rem' }} />
      </ToggleButton>
      <ToggleButton sx={{ flex: 1 }} value={false}>
        <Box
          sx={{
            maxWidth: '1.5rem',
            maxHeight: '1.5rem',
            overflow: 'hidden',
          }}
        >
          <BsGrid3X3
            style={{
              fontSize: '2.5rem',
              transform: 'translate(-20%, -20%)',
            }}
          />
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default MandalartViewToggle;
