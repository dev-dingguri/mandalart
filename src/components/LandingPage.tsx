import { Navigate, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Target, Grid3X3, CheckCircle2, ArrowRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import SEOHead from '@/components/SEOHead';
import { buttonVariants } from '@/components/ui/button';
import { PATH_APP, PATH_GUIDE, STORAGE_KEY_HAS_USED_TOOL } from '@/constants';

const STEPS = [
  {
    number: '①',
    title: '중심 목표 입력',
    description: '하나의 큰 목표를 중앙에 적으세요',
  },
  {
    number: '②',
    title: '8개 핵심 요소 도출',
    description: '목표 달성에 필요한 8가지 핵심 영역을 정하세요',
  },
  {
    number: '③',
    title: '64개 실행 계획 완성',
    description: '각 영역을 8개의 구체적인 행동으로 쪼개세요',
  },
];

const USE_CASES = [
  {
    title: '취업 준비',
    description: '자소서, 면접, 자격증, 체력관리까지 한눈에',
  },
  {
    title: '다이어트',
    description: '식단, 운동, 수면, 동기부여를 체계적으로',
  },
  {
    title: '자기계발',
    description: '독서, 어학, 재테크, 인맥관리를 균형있게',
  },
  {
    title: '사업 계획',
    description: '마케팅, 재무, 제품, 고객관리를 빠짐없이',
  },
];

const FAQS = [
  {
    question: '만다라트란 무엇인가요?',
    answer:
      '만다라트는 1987년 일본의 디자이너 이마이즈미 히로아키가 개발한 사고 확장 도구입니다. 중심 목표를 8개의 핵심 요소로, 다시 각 요소를 8개의 세부 행동으로 분해하여 총 81칸의 실행 계획을 만듭니다.',
  },
  {
    question: '만다라트 계획표는 무료인가요?',
    answer:
      '네, 완전 무료입니다. 회원가입 없이 바로 사용할 수 있으며, 로그인하면 여러 기기에서 데이터를 동기화할 수 있습니다.',
  },
  {
    question: '작성한 만다라트를 저장할 수 있나요?',
    answer:
      '게스트 모드에서는 브라우저에 자동 저장되며, Google 계정으로 로그인하면 클라우드에 안전하게 저장됩니다.',
  },
  {
    question: '만다라트는 몇 칸인가요?',
    answer:
      '총 81칸입니다. 중앙 1칸(핵심 목표) + 8칸(핵심 요소) + 72칸(세부 행동 계획)으로 구성됩니다.',
  },
  {
    question: '오타니 쇼헤이의 만다라트는 어떻게 생겼나요?',
    answer:
      '오타니 쇼헤이는 고교 1학년 때 \'드래프트 1순위 8구단 지명\'을 중심 목표로 만다라트를 작성했습니다. 체력, 멘탈, 구위, 제구 등 8개 핵심 요소를 설정하고 각각의 세부 실행 계획을 수립했습니다.',
  },
];

const LandingPage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  // 재방문자는 도구 페이지로 리다이렉트 — 이미 도구를 사용한 적이 있으면 랜딩 스킵
  const hasUsedTool = localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL);
  if (hasUsedTool) {
    return <Navigate to={`/${lang}${PATH_APP}`} replace />;
  }

  return (
    <div className="min-h-dvh">
      <SEOHead
        title="만다라트(Mandalart) - 꿈을 현실로 바꾸는 81칸의 마법"
        description="막연한 결심을 구체적인 행동으로. 만다라트로 당신의 실행력을 높이세요. 지금 바로 무료로 시작하세요."
        path={`/${lang}`}
      />

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Grid3X3 className="size-4" />
            <span>81칸의 목표 달성 시스템</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
            꿈을 현실로 바꾸는
            <br />
            <span className="text-primary">81칸의 마법</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            막연한 결심을 구체적인 행동으로. 만다라트로 당신의 실행력을 높이세요.
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            지금 시작하기
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>

      {/* 3-Step Usage Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
            3단계로 완성하는 나만의 실행 계획
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
            만다라트가 바꾸는 것
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before */}
            <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-destructive/15 text-destructive text-xs font-semibold">
                  Before
                </span>
                <h3 className="text-lg font-semibold text-foreground">막연한 목표</h3>
              </div>
              <blockquote className="text-2xl font-bold text-muted-foreground/70 mb-3">
                "올해는 건강해지자"
              </blockquote>
              <p className="text-sm text-muted-foreground">
                무엇을, 어떻게, 얼마나 해야 할지 막막합니다. 결국 작심삼일로 끝납니다.
              </p>
            </div>
            {/* After */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold">
                  After
                </span>
                <h3 className="text-lg font-semibold text-foreground">81칸으로 구체화된 계획</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {['운동', '식단', '수면', '검진', '스트레스 관리', '금연', '음주 절제', '멘탈 케어'].map(
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
                8개의 핵심 영역, 64개의 구체적인 행동 계획이 만들어집니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            어떤 목표에도 만다라트
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            취업, 건강, 자기계발, 사업까지 모든 분야에 적용할 수 있습니다.
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
              "오타니 쇼헤이도 고교 시절<br className="hidden md:block" /> 만다라트를 사용했습니다"
            </blockquote>
            <p className="text-muted-foreground mb-8">
              메이저리그 역사상 최고의 선수 중 하나인 오타니 쇼헤이는 고등학교 1학년 때
              만다라트로 자신의 목표를 구체화했습니다.
            </p>
            <Link
              to={`/${lang}${PATH_GUIDE}`}
              className={buttonVariants({ variant: 'outline', className: 'h-10 px-6 rounded-xl' })}
            >
              만다라트에 대해 더 알아보기
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
            자주 묻는 질문
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
            지금 바로 나만의 만다라트를 만들어보세요
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            로그인 없이 바로 시작할 수 있습니다. 완전 무료입니다.
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            무료로 시작하기
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
