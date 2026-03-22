import { memo, useEffect, useRef } from 'react';
import ItemGrid from '@/components/ItemGrid';
import TopicItem from '@/components/TopicItem';
import { TopicNode } from '@/types';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from '@/constants';

type FocusHandlers = {
  isFocused: boolean;
  onUpdateFocus: () => void;
};

type TopicGridProps = {
  onIsAccented: (gridItemIdx: number) => boolean;
  onGetTopic: (gridItemIdx: number) => TopicNode;
  onSelectItem: (gridItemIdx: number) => void;
  selectedGridItemIdx: number | null;
  focusHandlers?: FocusHandlers;
};

const TopicGrid = memo(({
  onIsAccented,
  onGetTopic,
  onSelectItem,
  selectedGridItemIdx,
  focusHandlers,
}: TopicGridProps) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isFocusTriedRef = useRef(false);

  const isFocused = focusHandlers?.isFocused;

  useEffect(() => {
    const isTried = isFocusTriedRef.current;
    isFocusTriedRef.current = true;

    isFocused && scrollCenter(gridRef.current, isTried ? 'smooth' : 'auto');
  }, [isFocused]);

  useEffect(() => {
    const handler = () => {
      isFocused && scrollCenter(gridRef.current, 'auto');
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [isFocused]);

  return (
    <div ref={gridRef}>
      <ItemGrid
        rowSize={TABLE_ROW_SIZE}
        colSize={TABLE_COL_SIZE}
        createItem={(gridItemIdx) => (
          <TopicItem
            key={gridItemIdx}
            topic={onGetTopic(gridItemIdx).text}
            isAccented={onIsAccented(gridItemIdx)}
            isEditable={isFocused !== false}
            isSelected={selectedGridItemIdx === gridItemIdx}
            onSelect={() => onSelectItem(gridItemIdx)}
          />
        )}
        spacing="2px"
        onClick={() => {
          scrollCenter(gridRef.current, 'smooth');
          focusHandlers?.onUpdateFocus();
        }}
      />
    </div>
  );
});
TopicGrid.displayName = 'TopicGrid';

const scrollCenter = (element: Element | null, behavior: ScrollBehavior) => {
  if (!element) return;
  element.scrollIntoView({
    behavior,
    block: 'center',
    inline: 'center',
  });
};

export default TopicGrid;
