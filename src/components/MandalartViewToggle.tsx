import { Maximize2 } from 'lucide-react';
import { Toggle } from 'components/ui/toggle';

type MandalartViewToggleProps = {
  isAllView: boolean;
  onChange: (isAllView: boolean) => void;
};

const MandalartViewToggle = ({
  isAllView,
  onChange,
}: MandalartViewToggleProps) => {
  return (
    <Toggle
      variant="outline"
      className="size-10 [&_svg]:size-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
      pressed={!isAllView}
      onPressedChange={(pressed) => onChange(!pressed)}
      aria-label={isAllView ? '확대 보기' : '전체 보기'}
    >
      <Maximize2 />
    </Toggle>
  );
};

export default MandalartViewToggle;
