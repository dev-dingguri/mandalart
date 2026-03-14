import { BsFullscreen } from 'react-icons/bs';
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
      className="size-10 [&_svg]:size-5 aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary"
      pressed={!isAllView}
      onPressedChange={(pressed) => onChange(!pressed)}
      aria-label={isAllView ? '확대 보기' : '전체 보기'}
    >
      <BsFullscreen />
    </Toggle>
  );
};

export default MandalartViewToggle;
