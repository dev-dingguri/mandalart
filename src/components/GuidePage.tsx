import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { buttonVariants } from '@/components/ui/button';
import { PATH_APP, PATH_GUIDE } from '@/constants';

// 별점 렌더링 — 최대 5개, filled/empty 구분
const StarRating = ({ count, max = 5 }: { count: number; max?: number }) => (
  <span aria-label={`${count}/${max}`} className="text-sm">
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={i < count ? 'text-primary' : 'text-muted-foreground/30'}>
        ★
      </span>
    ))}
  </span>
);

// 비교표의 별점 수치 — 텍스트가 아닌 고정 데이터이므로 컴포넌트 밖에 유지
const COMPARISON_RATINGS = [
  { specificity: 5, overview: 5, difficulty: 3 },
  { specificity: 3, overview: 4, difficulty: 2 },
  { specificity: 4, overview: 3, difficulty: 4 },
  { specificity: 2, overview: 2, difficulty: 1 },
  { specificity: 2, overview: 1, difficulty: 1 },
];

const STEP_NUMBERS = ['①', '②', '③', '④', '⑤'];

const GuidePage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const COMPARISON_DATA = COMPARISON_RATINGS.map((ratings, i) => ({
    method: t(`guide.comparisonTable.${i}.method`),
    structure: t(`guide.comparisonTable.${i}.structure`),
    ...ratings,
  }));

  const HOWTO_STEPS = STEP_NUMBERS.map((step, i) => ({
    step,
    title: t(`guide.howto.${i}.title`),
    body: t(`guide.howto.${i}.body`),
  }));

  const ohtaniElements = t('guide.ohtani.elements', { returnObjects: true }) as string[];
  const ohtaniLuckActions = t('guide.ohtani.luckActions', { returnObjects: true }) as string[];

  const APPLICATIONS = Array.from({ length: 4 }, (_, i) => ({
    category: t(`guide.applications.${i}.category`),
    items: t(`guide.applications.${i}.items`, { returnObjects: true }) as string[],
  }));

  return (
    <div className="min-h-dvh bg-background">
      <SEOHead
        title={t('guide.seo.title')}
        description={t('guide.seo.description')}
        path={`/${lang}${PATH_GUIDE}`}
      />

      {/* 상단 내비게이션 — 랜딩 페이지로 돌아가기 */}
      <nav className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center">
          <Link
            to={`/${lang}`}
            className={buttonVariants({
              variant: 'ghost',
              size: 'sm',
              className: 'gap-1.5 text-muted-foreground hover:text-foreground',
            })}
          >
            <ArrowLeft className="size-4" />
            {t('guide.nav.home')}
          </Link>
        </div>
      </nav>

      {/* 본문 아티클 */}
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">

        {/* H1 + 부제 */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            {t('guide.header.title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('guide.header.subtitle')}
          </p>
        </header>

        {/* 1. 기원과 역사 */}
        <section className="mb-12" aria-labelledby="section-history">
          <h2
            id="section-history"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.history.title')}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              {t('guide.history.paragraph1', { year: 1987 }).split(t('guide.history.paragraph1Strong'))[0]}
              <strong className="text-foreground">{t('guide.history.paragraph1Strong')}</strong>
              {t('guide.history.paragraph1', { year: 1987 }).split(t('guide.history.paragraph1Strong'))[1]}
            </p>
            <p>
              {t('guide.history.paragraph2')}{' '}
              <strong className="text-foreground">{t('guide.history.paragraph2Strong')}</strong>
              {t('guide.history.paragraph2Suffix')}
            </p>
            <p>
              {t('guide.history.paragraph3')}
            </p>
          </div>
        </section>

        {/* 2. 구조 */}
        <section className="mb-12" aria-labelledby="section-structure">
          <h2
            id="section-structure"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.structure.title')}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground mb-6">
            <p>
              {t('guide.structure.intro').split(t('guide.structure.introStrong'))[0]}
              <strong className="text-foreground">{t('guide.structure.introStrong')}</strong>
              {t('guide.structure.intro').split(t('guide.structure.introStrong'))[1]}
            </p>
          </div>

          {/* 구조 카드 3개 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{t('guide.structure.card0.count')}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{t('guide.structure.card0.label')}</div>
              <div className="text-xs text-muted-foreground">{t('guide.structure.card0.description')}</div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{t('guide.structure.card1.count')}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{t('guide.structure.card1.label')}</div>
              <div className="text-xs text-muted-foreground">{t('guide.structure.card1.description')}</div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{t('guide.structure.card2.count')}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{t('guide.structure.card2.label')}</div>
              <div className="text-xs text-muted-foreground">{t('guide.structure.card2.description')}</div>
            </div>
          </div>

          <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">{t('guide.structure.centerMatrixStrong')}</strong> {t('guide.structure.centerMatrix')}
            </p>
            <p>
              <strong className="text-foreground">{t('guide.structure.outerMatrixStrong')}</strong> {t('guide.structure.outerMatrix')}
            </p>
            <p>
              {t('guide.structure.summary')} <strong className="text-foreground">{t('guide.structure.summaryStrong')}</strong>
              {t('guide.structure.summarySuffix')}
            </p>
          </div>
        </section>

        {/* 3. 작성법 5단계 */}
        <section className="mb-12" aria-labelledby="section-howto">
          {/* HowTo 구조화 데이터 — Google 리치 결과("How-to" 스니펫)에 노출하기 위한 JSON-LD */}
          <Helmet>
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": t('guide.howto.title'),
                "description": t('guide.seo.description'),
                "step": HOWTO_STEPS.map(({ title, body }, i) => ({
                  "@type": "HowToStep",
                  "position": i + 1,
                  "name": title,
                  "text": body,
                })),
              })}
            </script>
          </Helmet>
          <h2
            id="section-howto"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.howto.title')}
          </h2>
          <ol className="space-y-5">
            {HOWTO_STEPS.map(({ step, title, body }) => (
              <li
                key={step}
                className="flex gap-4 p-5 rounded-xl bg-card border border-border"
              >
                <span className="text-2xl font-bold text-primary shrink-0 leading-none mt-0.5">
                  {step}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 4. 비교표 */}
        <section className="mb-12" aria-labelledby="section-comparison">
          <h2
            id="section-comparison"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.comparisonTable.title')}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground mb-6">
            {t('guide.comparisonTable.description')}
          </p>
          {/* 모바일 가로 스크롤 — 좁은 화면에서 테이블이 잘리지 않도록 */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t('guide.comparisonTable.headers.method')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t('guide.comparisonTable.headers.structure')}</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t('guide.comparisonTable.headers.specificity')}</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t('guide.comparisonTable.headers.overview')}</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t('guide.comparisonTable.headers.difficulty')}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_DATA.map((row, idx) => (
                  <tr
                    key={row.method}
                    className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                  >
                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                      {/* 만다라트 행 강조 — 이 페이지의 주제이므로 primary 색상으로 구분 */}
                      {idx === 0 ? (
                        <span className="text-primary font-semibold">{row.method}</span>
                      ) : (
                        row.method
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.structure}</td>
                    <td className="px-4 py-3 text-center">
                      <StarRating count={row.specificity} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StarRating count={row.overview} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StarRating count={row.difficulty} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. 오타니 쇼헤이 사례 */}
        <section className="mb-12" aria-labelledby="section-ohtani">
          <h2
            id="section-ohtani"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.ohtani.title')}
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              {t('guide.ohtani.intro').split(t('guide.ohtani.introStrong'))[0]}
              <strong className="text-foreground">{t('guide.ohtani.introStrong')}</strong>
              {t('guide.ohtani.intro').split(t('guide.ohtani.introStrong'))[1]}
            </p>
          </div>

          {/* 오타니 만다라트 핵심 내용 카드 */}
          <div className="mt-6 p-6 rounded-xl bg-card border border-border space-y-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('guide.ohtani.goalLabel')}
              </span>
              <p className="mt-1 text-lg font-bold text-foreground">
                {t('guide.ohtani.goalText')}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('guide.ohtani.elementsLabel')}
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {ohtaniElements.map(
                  (item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('guide.ohtani.luckLabel')}
              </span>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {ohtaniLuckActions.map((action) => (
                  <li key={action} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {t('guide.ohtani.conclusion')}
            <strong className="text-foreground">{t('guide.ohtani.conclusionStrong')}</strong>
            {t('guide.ohtani.conclusionSuffix')}
          </p>
        </section>

        {/* 6. 활용 분야 */}
        <section className="mb-16" aria-labelledby="section-applications">
          <h2
            id="section-applications"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            {t('guide.applications.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {APPLICATIONS.map(({ category, items }) => (
              <div
                key={category}
                className="p-5 rounded-xl bg-card border border-border"
              >
                <h3 className="text-base font-semibold text-foreground mb-3">{category}</h3>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-10 px-6 rounded-2xl bg-primary/5 border border-primary/20 text-center"
          aria-label={t('guide.cta.ariaLabel')}
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            {t('guide.cta.preTitle')}
          </p>
          <p className="text-muted-foreground mb-6">
            {t('guide.cta.title')}
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            {t('guide.cta.button')}
            <ArrowRight className="size-5" />
          </Link>
        </section>
      </article>
    </div>
  );
};

export default GuidePage;
