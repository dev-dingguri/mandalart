import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { buttonVariants } from '@/components/ui/button';
import { PATH_APP, PATH_GUIDE } from '@/constants';

// 비교표 데이터 — 방법론별 5가지 속성 비교
const COMPARISON_DATA = [
  {
    method: '만다라트',
    structure: '9×9 매트릭스',
    specificity: 5,
    overview: 5,
    difficulty: 3,
  },
  {
    method: '마인드맵',
    structure: '방사형 트리',
    specificity: 3,
    overview: 4,
    difficulty: 2,
  },
  {
    method: 'OKR',
    structure: '목표-핵심결과',
    specificity: 4,
    overview: 3,
    difficulty: 4,
  },
  {
    method: '비전보드',
    structure: '이미지 콜라주',
    specificity: 2,
    overview: 2,
    difficulty: 1,
  },
  {
    method: '버킷리스트',
    structure: '단순 목록',
    specificity: 2,
    overview: 1,
    difficulty: 1,
  },
];

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

const GuidePage = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <div className="min-h-dvh bg-background">
      <SEOHead
        title="만다라트(Mandalart)란? — 목표 달성을 위한 최고의 사고 확장 도구"
        description="만다라트의 기원, 구조, 작성법을 상세히 알아보세요. 81칸으로 목표를 구체적인 실행 계획으로 바꾸는 방법을 안내합니다."
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
            홈으로
          </Link>
        </div>
      </nav>

      {/* 본문 아티클 */}
      <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">

        {/* H1 + 부제 */}
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            만다라트(Mandalart)란?
          </h1>
          <p className="text-lg text-muted-foreground">
            목표 달성을 위한 최고의 사고 확장 도구
          </p>
        </header>

        {/* 1. 기원과 역사 */}
        <section className="mb-12" aria-labelledby="section-history">
          <h2
            id="section-history"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            만다라트의 기원과 역사
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              만다라트는 <strong className="text-foreground">1987년 일본의 디자이너 이마이즈미 히로아키(今泉浩晃)</strong>가
              개발한 사고 확장 도구입니다. 불교의 만다라(曼荼羅)에서 영감을 받은 대칭 구조에서 출발했습니다.
            </p>
            <p>
              이름 자체가 세 단어의 합성어입니다. <strong className="text-foreground">"목표 달성(Manda) + 기술(la) + 아트(Art)"</strong>—
              즉 목표를 달성하는 기술을 예술로 승화시킨다는 뜻을 담고 있습니다.
            </p>
            <p>
              만다라의 방사형 대칭 구조처럼, 만다라트도 중심 목표에서 출발해 바깥으로 사고를 균형 있게
              확장합니다. 이 구조적 특성이 뇌가 연상과 발산을 자연스럽게 수행하도록 돕는다는 점에서
              만다라와 유사합니다.
            </p>
          </div>
        </section>

        {/* 2. 구조 */}
        <section className="mb-12" aria-labelledby="section-structure">
          <h2
            id="section-structure"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            만다라트의 구조 — 81칸의 비밀
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground mb-6">
            <p>
              만다라트는 <strong className="text-foreground">9×9 = 81칸</strong>의 격자로 구성됩니다.
              이 81칸은 세 계층으로 이루어진 정교한 구조를 갖고 있습니다.
            </p>
          </div>

          {/* 구조 카드 3개 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <div className="text-3xl font-bold text-primary mb-1">1칸</div>
              <div className="text-sm font-semibold text-foreground mb-1">핵심 목표</div>
              <div className="text-xs text-muted-foreground">9×9 격자의 정중앙</div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-foreground mb-1">8칸</div>
              <div className="text-sm font-semibold text-foreground mb-1">핵심 요소</div>
              <div className="text-xs text-muted-foreground">중앙 목표를 둘러싼 8개</div>
            </div>
            <div className="p-5 rounded-xl bg-card border border-border text-center">
              <div className="text-3xl font-bold text-foreground mb-1">64칸</div>
              <div className="text-sm font-semibold text-foreground mb-1">세부 행동</div>
              <div className="text-xs text-muted-foreground">각 핵심 요소별 8개 행동</div>
            </div>
          </div>

          <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">중앙 3×3 매트릭스:</strong> 정중앙 1칸이 핵심 목표이고,
              그 주위 8칸이 핵심 요소입니다.
            </p>
            <p>
              <strong className="text-foreground">외곽 8개의 3×3 매트릭스:</strong> 각 핵심 요소가
              다시 자신만의 3×3 블록 중앙을 차지하고, 그 주위 8칸이 구체적인 세부 행동이 됩니다.
            </p>
            <p>
              결과적으로 <strong className="text-foreground">1개 핵심 목표 + 8개 핵심 요소 + 64개 세부 행동 = 73개의 의미 있는 칸</strong>이
              완성됩니다. (나머지 8칸은 구조상 비어 있는 모서리 블록입니다.)
            </p>
          </div>
        </section>

        {/* 3. 작성법 5단계 */}
        <section className="mb-12" aria-labelledby="section-howto">
          <h2
            id="section-howto"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            만다라트 작성법 — 5단계 가이드
          </h2>
          <ol className="space-y-5">
            {[
              {
                step: '①',
                title: '중심 목표 설정',
                body: 'SMART 원칙을 적용하세요. 구체적(Specific)이고 측정 가능(Measurable)하며, 달성 가능(Achievable)하고 관련성(Relevant) 있는, 시간 제한(Time-bound)이 있는 목표를 중앙 1칸에 씁니다.',
              },
              {
                step: '②',
                title: '8개 핵심 요소 도출',
                body: '목표를 이루기 위해 반드시 필요한 8가지 카테고리를 브레인스토밍합니다. 이 단계가 만다라트의 핵심입니다. 생각나는 것을 모두 적고, 가장 중요한 8개를 선별하세요.',
              },
              {
                step: '③',
                title: '세부 행동 작성',
                body: '각 핵심 요소마다 8개의 구체적인 행동 계획을 작성합니다. "매일 30분 걷기"처럼 실제로 실행할 수 있는 수준으로 구체화하세요.',
              },
              {
                step: '④',
                title: '우선순위 정하기',
                body: '64개의 세부 행동 중 가장 중요하고 실현 가능한 것부터 시작합니다. 모든 칸을 동시에 채울 필요는 없습니다.',
              },
              {
                step: '⑤',
                title: '실행 및 리뷰',
                body: '주기적으로 진행 상황을 체크하고, 달성한 항목은 표시하세요. 상황이 바뀌면 과감히 수정합니다. 만다라트는 살아 있는 계획서여야 합니다.',
              },
            ].map(({ step, title, body }) => (
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
            만다라트 vs 다른 목표 설정 방법
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground mb-6">
            만다라트는 여러 목표 설정 방법 중에서도 구체성과 전체 조망 측면에서 독보적인 위치를
            차지합니다.
          </p>
          {/* 모바일 가로 스크롤 — 좁은 화면에서 테이블이 잘리지 않도록 */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">방법</th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">구조</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">구체성</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">전체 조망</th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground whitespace-nowrap">난이도</th>
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
            오타니 쇼헤이의 만다라트
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              만다라트를 세계적으로 알린 가장 유명한 사례는 <strong className="text-foreground">오타니 쇼헤이</strong>입니다.
              그는 하나마키히가시 고등학교 1학년 때 만다라트를 작성했습니다.
            </p>
          </div>

          {/* 오타니 만다라트 핵심 내용 카드 */}
          <div className="mt-6 p-6 rounded-xl bg-card border border-border space-y-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                중심 목표
              </span>
              <p className="mt-1 text-lg font-bold text-foreground">
                드래프트 1순위 8구단 지명
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                8개 핵심 요소
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {['체력', '제구', '구위', '스피드 160km/h', '변화구', '운', '인간성', '멘탈'].map(
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
                '운' 세부 행동 (일부)
              </span>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {[
                  '인사하기',
                  '쓰레기 줍기',
                  '부실 청소',
                  '심판에 대한 태도',
                  '응원받는 사람이 되기',
                ].map((action) => (
                  <li key={action} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            오타니는 실제로 MLB에서 역사적인 성과를 이루었습니다. 특히 주목할 점은 "운"이라는
            핵심 요소입니다. 그는 운조차 통제할 수 있는 것처럼 다루었고, 그 세부 행동들이
            <strong className="text-foreground"> 인성과 태도</strong>에 집중되어 있다는 것이
            만다라트의 깊이를 보여줍니다.
          </p>
        </section>

        {/* 6. 활용 분야 */}
        <section className="mb-16" aria-labelledby="section-applications">
          <h2
            id="section-applications"
            className="text-2xl font-bold mb-6 text-foreground"
          >
            만다라트 활용 분야
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                category: '개인 목표',
                items: ['건강 관리', '자기계발', '재테크', '생활 습관 형성'],
              },
              {
                category: '학업',
                items: ['수능 준비', '자격증 취득', '진학 계획', '어학 공부'],
              },
              {
                category: '비즈니스',
                items: ['사업 계획 수립', '프로젝트 관리', '마케팅 전략', '성과 목표 설정'],
              },
              {
                category: '팀 워크숍',
                items: ['조직 비전 수립', '팀 목표 정렬', '업무 프로세스 개선', '아이디어 발굴'],
              },
            ].map(({ category, items }) => (
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
          aria-label="시작하기 안내"
        >
          <p className="text-lg font-semibold text-foreground mb-2">
            이론은 충분합니다.
          </p>
          <p className="text-muted-foreground mb-6">
            지금 바로 만다라트를 작성해보세요
          </p>
          <Link
            to={`/${lang}${PATH_APP}`}
            className={buttonVariants({ className: 'h-12 px-8 text-base rounded-xl' })}
          >
            시작하기
            <ArrowRight className="size-5" />
          </Link>
        </section>
      </article>
    </div>
  );
};

export default GuidePage;
