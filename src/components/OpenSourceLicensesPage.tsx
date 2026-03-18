import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import openSourceLicensesJson from '@/assets/data/openSourceLicenses.json';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

// openSourceLicenses.json — `pnpm licenses` 로 재생성

type License = {
  name: string;
  licenses: string;
  repository: string;
};

const licensesObj: { [key: string]: License } = openSourceLicensesJson;
const licenses = Object.keys(licensesObj).map((key) => licensesObj[key]);

const Item = ({ name, licenses, repository }: License) => {
  return (
    <li className="flex select-text flex-col items-start px-4 py-2 [content-visibility:auto] [contain-intrinsic-size:auto_5rem]">
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground">{licenses}</span>
      <a
        href={repository}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-foreground/70 no-underline"
      >
        {repository}
      </a>
      <Separator className="mt-2 -mx-4 w-[calc(100%+2rem)]" />
    </li>
  );
};

const OpenSourceLicensesPage = () => {
  const [currentLicenses, setCurrentLicenses] = useState<License[]>([]);
  const { t } = useTranslation();
  const hasMore = currentLicenses.length < licenses.length;

  useEffect(() => {
    setCurrentLicenses(licenses.slice(0, 50));
  }, []);

  const appendLicenses = useCallback(() => {
    setCurrentLicenses((prev) => licenses.slice(0, prev.length + 50));
  }, []);

  const sentinelRef = useInfiniteScroll(appendLicenses);
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center">
      <header className="flex w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] items-center gap-1 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('..')}
          className="mr-1"
        >
          <ChevronLeft />
        </Button>
        <h1 className="text-lg font-semibold text-balance">{t('settings.oss')}</h1>
      </header>
      <Separator />
      <div className="flex w-full justify-center overflow-y-auto [scrollbar-gutter:stable_both-edges]">
        <div className="flex w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] flex-col">
          <ul className="p-0">
            {currentLicenses.map((data) => (
              <Item key={data.name} {...data} />
            ))}
          </ul>
          {hasMore && (
            <div ref={sentinelRef} className="m-2 flex justify-center">
              <div className="size-12 motion-safe:animate-spin rounded-full border-4 border-muted border-t-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenSourceLicensesPage;
