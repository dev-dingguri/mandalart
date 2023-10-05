import { useEffect, useRef } from 'react';
import ItemGrid from 'components/ItemGrid';
import TopicItem from 'components/TopicItem';
import { TopicNode } from 'types/TopicNode';
import { scrollIntoView } from 'seamless-scroll-polyfill';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from 'constants/constants';
import Box from '@mui/material/Box';
import { useEventListener } from 'usehooks-ts';

type FocusHandlers = {
  isFocused: boolean;
  onUpdateFocuse: () => void;
};

type TopicGridProps = {
  onIsAccented: (gridItemIdx: number) => boolean;
  onGetTopic: (gridItemIdx: number) => TopicNode;
  onUpdateTopic: (gridItemIdx: number, text: string) => void;
  focusHandlers?: FocusHandlers;
};

const TopicGrid = ({
  onIsAccented,
  onGetTopic,
  onUpdateTopic,
  focusHandlers,
}: TopicGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    focusHandlers?.isFocused && scrollCenter(gridRef.current, 'auto');
  }, [focusHandlers?.isFocused]);

  useEventListener('resize', () => {
    focusHandlers?.isFocused && scrollCenter(gridRef.current, 'auto');
  });

  return (
    <Box ref={gridRef}>
      <ItemGrid
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        createItem={(gridItemIdx) => (
          <TopicItem
            key={gridItemIdx}
            topic={onGetTopic(gridItemIdx).text}
            isAccented={onIsAccented(gridItemIdx)}
            isEditable={focusHandlers?.isFocused !== false}
            onUpdateTopic={(text) => onUpdateTopic(gridItemIdx, text)}
          />
        )}
        spacing="2px"
        onClick={() => {
          scrollCenter(gridRef.current, 'smooth');
          focusHandlers && focusHandlers.onUpdateFocuse();
        }}
      />
    </Box>
  );
};

const scrollCenter = (element: Element | null, behavior: ScrollBehavior) => {
  if (!element) return;
  scrollIntoView(element, {
    behavior: behavior,
    block: 'center',
    inline: 'center',
  });
};

export default TopicGrid;
