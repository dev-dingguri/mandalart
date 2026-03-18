import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Github, Youtube } from 'lucide-react';
import { APP_VERSION } from '@/version';
import { PATH_OSS } from '@/constants';
import { useThemeStore, TernaryDarkMode } from '@/stores/useThemeStore';
import { trackLanguageChange, trackThemeChange } from '@/lib/analyticsEvents';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('settings.theme.label')}</span>
            <Select
              value={ternaryDarkMode}
              onValueChange={(val) => {
                setTernaryDarkMode(val as TernaryDarkMode);
                trackThemeChange(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {themeOptions.map(({ value, name }) => (
                    <SelectItem key={value} value={value}>
                      {t(name)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('settings.language')}</span>
            <Select
              value={i18n.language}
              onValueChange={(val) => {
                i18n.changeLanguage(val);
                trackLanguageChange(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {languageOptions.map(({ value, name }) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

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

          <p className="select-text text-sm text-muted-foreground">
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
