import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import openSourceLicensesJson from 'assets/data/openSourceLicenses.json';
import { Button } from 'components/ui/button';
import { Separator } from 'components/ui/separator';

/*
 * openSourceLicenses.json
 * Created with 'license-checker --production -excludePrivatePackages --customPath [customPath.json] --json > openSourceLicenses.json'
 * 만들어진 파일에 공백("")이 있을 수 있습니다.
 * [customPath.json]
 * {
 *   "name": "",
 *   "version": false,
 *   "description": false,
 *   "repository": "",
 *   "publisher": false,
 *   "email": false,
 *   "url": false,
 *   "licenses": "",
 *   "licenseFile": false,
 *   "licenseText": false,
 *   "licenseModified": false,
 *   "copyright": false,
 *   "path": false
 *  }
 */

type License = {
  name: string;
  licenses: string;
  repository: string;
};

const licensesObj: { [key: string]: License } = openSourceLicensesJson;
const licenses = Object.keys(licensesObj).map((key) => licensesObj[key]);

const Item = ({ name, licenses, repository }: License) => {
  return (
    <>
      <li className="flex flex-col items-start px-4 py-2">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{licenses}</span>
        <a
          href={repository}
          target="blank"
          className="text-xs text-foreground/70 no-underline"
        >
          {repository}
        </a>
      </li>
      <Separator />
    </>
  );
};

const OpenSourceLicensesPage = () => {
  const [currentLicenses, setCurrentLicenses] = useState<License[]>([]);
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = currentLicenses.length < licenses.length;

  useEffect(() => {
    setCurrentLicenses(licenses.slice(0, 50));
  }, []);

  const appendLicenses = useCallback(() => {
    setCurrentLicenses((prev) => licenses.slice(0, prev.length + 50));
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          appendLicenses();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [appendLicenses]);

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
        <h1 className="text-lg font-semibold">{t('oss.label')}</h1>
      </header>
      <Separator />
      <div className="flex w-full justify-center overflow-y-auto [scrollbar-gutter:stable_both-edges]">
        <div className="flex w-[var(--size-content-width)] min-w-[var(--size-content-min-width)] flex-col">
          <ul className="p-0">
            {currentLicenses.map((data, idx) => (
              <Item key={idx} {...data} />
            ))}
          </ul>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center m-2">
              <div className="size-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpenSourceLicensesPage;
