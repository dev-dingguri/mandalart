import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsYoutube, BsChevronDown } from 'react-icons/bs';
import { APP_VERSION } from 'version';
import { PATH_OSS } from '../constants/constants';
import { useThemeStore, TernaryDarkMode } from 'stores/useThemeStore';
import { Drawer, DrawerContent } from 'components/ui/drawer';
import { Separator } from 'components/ui/separator';

type InlineSelectProps = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

const InlineSelect = ({
  label,
  value,
  options,
  onChange,
}: InlineSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [isOpen]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        >
          {selectedLabel}
          <BsChevronDown
            className={`size-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-lg border border-input bg-popover shadow-lg">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-accent ${
                  opt.value === value
                    ? 'font-medium text-foreground'
                    : ''
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const languageOptions = [
  { value: 'en', name: 'English' },
  { value: 'ko', name: '한국어' },
  { value: 'ja', name: '日本語' },
  { value: 'zh-CN', name: '中文 (简体)' },
];

const themeOptions = [
  { value: 'system', name: 'theme.options.system' },
  { value: 'light', name: 'theme.options.light' },
  { value: 'dark', name: 'theme.options.dark' },
];

type RightDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const RightDrawer = ({ isOpen, onClose }: RightDrawerProps) => {
  const { ternaryDarkMode, setTernaryDarkMode } = useThemeStore();

  const { t, i18n } = useTranslation();

  const navigate = useNavigate();
  const goToOpenSourceLicense = () => {
    navigate(`/${i18n.language}${PATH_OSS}`);
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="right"
    >
      <DrawerContent>
        <div className="flex flex-col gap-4 overflow-auto p-4 [scrollbar-gutter:stable_both-edges]">
          <InlineSelect
            label={t('theme.label')}
            value={ternaryDarkMode}
            options={themeOptions.map(({ value, name }) => ({
              value,
              label: t(name),
            }))}
            onChange={(val) => setTernaryDarkMode(val as TernaryDarkMode)}
          />

          <Separator />

          <InlineSelect
            label={t('language.label')}
            value={i18n.language}
            options={languageOptions.map(({ value, name }) => ({
              value,
              label: name,
            }))}
            onChange={(val) => i18n.changeLanguage(val)}
          />

          <Separator />

          <button
            className="cursor-pointer text-left text-sm hover:text-foreground"
            onClick={goToOpenSourceLicense}
          >
            {t('oss.label')}
          </button>

          <Separator />

          <div className="flex items-center gap-2 text-sm">
            <span>{t('version.label')}</span>
            <span className="text-muted-foreground">{APP_VERSION}</span>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground">
            dingguri.lab@gmail.com
          </p>

          <div className="flex gap-3">
            <BsYoutube
              className="size-6 cursor-pointer hover:text-foreground"
              onClick={() =>
                window.open(
                  'https://www.youtube.com/channel/UCoZkSE87r1jR1HasRJpPX3g'
                )
              }
            />
            <BsGithub
              className="size-6 cursor-pointer hover:text-foreground"
              onClick={() =>
                window.open('https://github.com/dev-dingguri/mandalart')
              }
            />
          </div>

          <p className="text-sm text-muted-foreground">
            DINGGURI.LAB. ALL RIGHTS RESERVED
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default RightDrawer;
