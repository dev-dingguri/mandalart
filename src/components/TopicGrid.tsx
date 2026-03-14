import { useEffect, useRef } from 'react';
import ItemGrid from '@/components/ItemGrid';
import TopicItem from '@/components/TopicItem';
import { TopicNode } from '@/types/TopicNode';
import { TABLE_ROW_SIZE, TABLE_COL_SIZE } from '@/constants/constants';

type FocusHandlers = {
  isFocused: boolean;
  onUpdateFocus: () => void;
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
            onUpdateTopic={(text) => onUpdateTopic(gridItemIdx, text)}
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
};

const scrollCenter = (element: Element | null, behavior: ScrollBehavior) => {
  if (!element) return;
  element.scrollIntoView({
    behavior: behavior,
    block: 'center',
    inline: 'center',
  });
};

export default TopicGrid;
