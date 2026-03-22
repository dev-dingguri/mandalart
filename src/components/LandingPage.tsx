import { Navigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Target, Grid3X3, CheckCircle2, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEOHead from '@/components/SEOHead';
import { buttonVariants } from '@/components/ui/button';
import { PATH_APP, PATH_GUIDE, STORAGE_KEY_HAS_USED_TOOL } from '@/constants';

const STEP_NUMBERS = ['①', '②', '③'];

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const STEPS = STEP_NUMBERS.map((number, i) => ({
    number,
    title: t(`landing.steps.${i}.title`),
    description: t(`landing.steps.${i}.description`),
  }));

  const USE_CASES = Array.from({ length: 4 }, (_, i) => ({
    title: t(`landing.useCases.${i}.title`),
    description: t(`landing.useCases.${i}.description`),
  }));

  const FAQS = Array.from({ length: 5 }, (_, i) => ({
    question: t(`landing.faqs.${i}.question`),
    answer: t(`landing.faqs.${i}.answer`),
  }));

  const afterItems = t('landing.comparison.after.items', { returnObjects: true }) as string[];

  // 재방문자는 도구 페이지로 리다이렉트 — 이미 도구를 사용한 적이 있으면 랜딩 스킵
  const hasUsedTool = localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL);
  if (hasUsedTool) {
    return <Navigate to={`/${lang}${PATH_APP}`} replace />;
  }

  return (
    <main className="min-h-dvh">
      <SEOHead
        title={t('landing.seo.title')}
        description={t('landing.seo.description')}
        path={`/${lang}`}
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Grid3X3 className="size-4" />
            <span>{t('landing.hero.badge')}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            {t('landing.hero.titleLine1')}
            <br />
            <span className="text-primary">{t('landing.hero.titleLine2')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            {t('landing.hero.cta')}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* 3-Step Usage Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            {t('landing.steps.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border"
              >
                <div className="text-3xl font-bold text-primary mb-4">{step.number}</div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="size-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            {t('landing.comparison.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-destructive/15 text-destructive text-xs font-semibold">
                  {t('landing.comparison.before.label')}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{t('landing.comparison.before.title')}</h3>
              </div>
              <blockquote className="text-2xl font-bold text-muted-foreground/70 mb-3">
                {t('landing.comparison.before.quote')}
              </blockquote>
              <p className="text-sm text-muted-foreground">
                {t('landing.comparison.before.description')}
              </p>
            </div>
            {/* After */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold">
                  {t('landing.comparison.after.label')}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{t('landing.comparison.after.title')}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {afterItems.map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                    >
                      <CheckCircle2 className="size-3" />
                      {item}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('landing.comparison.after.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            {t('landing.useCases.title')}
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            {t('landing.useCases.subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map((useCase) => (
              <div
                key={useCase.title}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
              >
                <h3 className="text-base font-semibold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-5xl mb-6">⚾</div>
            <blockquote className="text-xl md:text-2xl font-semibold text-foreground mb-4 leading-relaxed">
              {t('landing.socialProof.quote')}
            </blockquote>
            <p className="text-muted-foreground mb-8">
              {t('landing.socialProof.description')}
            </p>
            <Link
              to={`/${lang}${PATH_GUIDE}`}
              className={buttonVariants({ variant: 'outline', className: 'h-10 px-6 rounded-xl' })}
            >
              {t('landing.socialProof.cta')}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": FAQS.map((faq) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer,
                },
              })),
            })}
          </script>
        </Helmet>
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            {t('landing.faqs.title')}
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq) => (
              // <details>/<summary>로 경량 아코디언 구현 — shadcn Accordion 미설치 상태
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer font-medium text-foreground list-none hover:bg-muted/50 transition-colors">
                  <span>{faq.question}</span>
                  {/* CSS group-open으로 아이콘 회전 처리 */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-primary/5 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-foreground">
            {t('landing.cta.title')}
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            {t('landing.cta.subtitle')}
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            {t('landing.cta.button')}
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
