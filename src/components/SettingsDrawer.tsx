import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Github, Youtube, ChevronDown } from 'lucide-react';
import { APP_VERSION } from '@/version';
import { PATH_OSS } from '@/constants/constants';
import { useThemeStore, TernaryDarkMode } from '@/stores/useThemeStore';
import useAnalyticsEvents from '@/hooks/useAnalyticsEvents';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';

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
          <ChevronDown
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
  { value: 'system', name: 'settings.theme.options.system' },
  { value: 'light', name: 'settings.theme.options.light' },
  { value: 'dark', name: 'settings.theme.options.dark' },
];

type SettingsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SettingsDrawer = ({ isOpen, onClose }: SettingsDrawerProps) => {
  const { ternaryDarkMode, setTernaryDarkMode } = useThemeStore();

  const { t, i18n } = useTranslation();
  const { trackLanguageChange, trackThemeChange } = useAnalyticsEvents();

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
      <DrawerContent aria-describedby={undefined}>
        <DrawerTitle className="sr-only">{t('settings.title')}</DrawerTitle>
        <div className="flex flex-col gap-4 overflow-auto p-4 [scrollbar-gutter:stable_both-edges]">
          <InlineSelect
            label={t('settings.theme.label')}
            value={ternaryDarkMode}
            options={themeOptions.map(({ value, name }) => ({
              value,
              label: t(name),
            }))}
            onChange={(val) => {
              setTernaryDarkMode(val as TernaryDarkMode);
              trackThemeChange(val);
            }}
          />

          <Separator />

          <InlineSelect
            label={t('settings.language')}
            value={i18n.language}
            options={languageOptions.map(({ value, name }) => ({
              value,
              label: name,
            }))}
            onChange={(val) => {
              i18n.changeLanguage(val);
              trackLanguageChange(val);
            }}
          />

          <Separator />

          <button
            className="cursor-pointer text-left text-sm hover:text-foreground"
            onClick={goToOpenSourceLicense}
          >
            {t('settings.oss')}
          </button>

          <Separator />

          <div className="flex items-center gap-2 text-sm">
            <span>{t('settings.version')}</span>
            <span className="text-muted-foreground">{APP_VERSION}</span>
          </div>

          <Separator />

          <p className="text-sm text-muted-foreground">
            dingguri.lab@gmail.com
          </p>

          <div className="flex gap-1">
            <a
              href="https://www.youtube.com/channel/UCoZkSE87r1jR1HasRJpPX3g"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('settings.youtube')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Youtube className="size-5" />
            </a>
            <a
              href="https://github.com/dev-dingguri/mandalart"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('settings.github')}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Github className="size-5" />
            </a>
          </div>

          <p className="text-sm text-muted-foreground">
            DINGGURI.LAB. ALL RIGHTS RESERVED
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
