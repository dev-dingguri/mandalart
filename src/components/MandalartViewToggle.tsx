import { Maximize2 } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useTranslation } from 'react-i18next';

type MandalartViewToggleProps = {
  isAllView: boolean;
  onChange: (isAllView: boolean) => void;
};

const MandalartViewToggle = ({
  isAllView,
  onChange,
}: MandalartViewToggleProps) => {
  const { t } = useTranslation();

  return (
    <Toggle
      variant="outline"
      className="size-10 [&_svg]:size-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
      pressed={!isAllView}
      onPressedChange={(pressed) => onChange(!pressed)}
      aria-label={isAllView ? t('mandalart.viewFocus') : t('mandalart.viewAll')}
    >
      <Maximize2 />
    </Toggle>
  );
};

export default MandalartViewToggle;
