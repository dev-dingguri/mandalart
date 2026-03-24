import {
  useCallback,
  HTMLAttributes,
  useState,
  useRef,
  useEffect,
} from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';
import { useTitleEdit } from '@/hooks/useTitleEdit';
import MandalartFocusView from '@/components/MandalartFocusView';
import Mandalart, {
  MandalartProps,
  SelectedCell,
} from '@/components/Mandalart';
import BottomInputBar from '@/components/BottomInputBar';
import PopoverCellInput from '@/components/PopoverCellInput';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { MandalartMeta, TopicNode } from '@/types';
import {
  MAX_MANDALART_TITLE_SIZE,
  MAX_TOPIC_TEXT_SIZE,
  TMP_MANDALART_ID,
} from '@/constants';
import {
  getAdjacentCell,
  getVerticalAdjacentCell,
  getCellPosition,
  getTopic,
} from '@/lib/cellNavigation';
import MandalartViewToggle from '@/components/MandalartViewToggle';
import { useTranslation } from 'react-i18next';
import { trackViewModeChange } from '@/lib/analyticsEvents';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

type MandalartViewProps = {
  mandalartId: string;
  meta: MandalartMeta;
  topicTree: TopicNode;
  onMandalartMetaChange: (meta: MandalartMeta) => void;
  onTopicTreeChange: (topicTree: TopicNode) => void;
} & HTMLAttributes<HTMLDivElement>;

const MandalartView = ({
  mandalartId,
  meta,
  topicTree,
  onMandalartMetaChange,
  onTopicTreeChange,
  className,
  ...rest
}: MandalartViewProps) => {
  const [isAllView, setIsAllView] = useState(true);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 48rem)');

  const titleEdit = useTitleEdit({
    mandalartId,
    metaTitle: meta.title,
    onMandalartMetaChange,
  });

  const rootRef = useRef<HTMLDivElement>(null);

  // Refs — stable 콜백에서 최신 값에 접근하기 위한 useLatestRef 패턴
  const selectedCellRef = useLatestRef(selectedCell);
  const editingTextRef = useRef(''); // 콜백에서 imperative하게 갱신하는 값 — useLatestRef 불가
  const topicTreeRef = useLatestRef(topicTree);
  const onTopicTreeChangeRef = useLatestRef(onTopicTreeChange);
  const isAllViewRef = useLatestRef(isAllView);

  const handleGetTopic = useCallback(
    (gridIdx: number, gridItemIdx: number) =>
      getTopic(topicTree, gridIdx, gridItemIdx),
    [topicTree],
  );

  // 현재 편집 중인 셀의 텍스트를 저장 (변경된 경우에만)
  const saveCellText = useCallback(() => {
    const cell = selectedCellRef.current;
    if (!cell) return;
    const text = editingTextRef.current;
    if (text.length > MAX_TOPIC_TEXT_SIZE) return;
    const tree = topicTreeRef.current;
    const node = getTopic(tree, cell.gridIdx, cell.gridItemIdx);
    if (node.text === text) return;

    const newTree = structuredClone(tree);
    getTopic(newTree, cell.gridIdx, cell.gridItemIdx).text = text;
    onTopicTreeChangeRef.current(newTree);
  }, []);

  // 셀 선택 — Mandalart → TopicGrid → TopicItem으로 전달되는 stable 콜백
  const handleSelectCell = useCallback(
    (gridIdx: number, gridItemIdx: number) => {
      saveCellText();
      setSelectedCell({ gridIdx, gridItemIdx });
      editingTextRef.current = getTopic(
        topicTreeRef.current,
        gridIdx,
        gridItemIdx,
      ).text;
    },
    [saveCellText],
  );

  // 편집 시 키보드를 고려한 중앙 정렬 (모바일 전용)
  // 데스크톱에서는 팝오버가 셀 근처에 위치하므로 패딩 보정이 불필요.
  // 부모 스크롤 컨테이너에 padding-bottom을 동적으로 추가하여
  // my-auto가 '키보드를 제외한 보이는 영역' 기준으로 중앙 정렬하도록 함.
  // iOS: layout viewport는 그대로이고 visual viewport만 축소되므로,
  // padding-bottom으로 flex 가용 공간을 줄여 my-auto 재계산을 유도.
  // Android: innerHeight도 함께 줄어들어 keyboardOffset ≈ 0 → 입력 바 높이만 반영.
  const isEditing = selectedCell !== null;
  useEffect(() => {
    const el = rootRef.current;
    if (!isEditing || isDesktop || !el) return;

    const scrollContainer = el.parentElement;
    if (!scrollContainer) return;

    const INPUT_BAR_HEIGHT = 64;

    const updateCentering = () => {
      const vv = window.visualViewport;
      const keyboardOffset = vv
        ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        : 0;

      scrollContainer.style.paddingBottom = `${keyboardOffset + INPUT_BAR_HEIGHT}px`;
    };

    updateCentering();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', updateCentering, { passive: true });
      vv.addEventListener('scroll', updateCentering, { passive: true });
    }

    return () => {
      scrollContainer.style.paddingBottom = '';
      if (vv) {
        vv.removeEventListener('resize', updateCentering);
        vv.removeEventListener('scroll', updateCentering);
      }
    };
  }, [isEditing, isDesktop]);

  // 만다라트 전환 시 선택 해제
  useEffect(() => {
    setSelectedCell(null);
    editingTextRef.current = '';
  }, [mandalartId]);

  // Focus View 스와이프 시 현재 편집 저장 후 선택 해제
  const handleFocusedGridChange = useCallback(() => {
    saveCellText();
    setSelectedCell(null);
  }, [saveCellText]);

  // BottomInputBar에서 텍스트 변경 시 ref만 갱신 (state 불필요 — 그리드 리렌더 방지)
  const handleEditingTextChange = useCallback((text: string) => {
    editingTextRef.current = text;
  }, []);

  // BottomInputBar 네비게이션: 저장 후 인접 셀로 이동
  const handleSaveAndNavigate = useCallback(
    (delta: 1 | -1) => {
      saveCellText();
      const cell = selectedCellRef.current;
      if (!cell) return;
      const nextCell = getAdjacentCell(cell, delta, isAllViewRef.current);
      setSelectedCell(nextCell);
      editingTextRef.current = getTopic(
        topicTreeRef.current,
        nextCell.gridIdx,
        nextCell.gridItemIdx,
      ).text;
    },
    [saveCellText],
  );

  const handleSaveAndPrev = useCallback(
    () => handleSaveAndNavigate(-1),
    [handleSaveAndNavigate],
  );

  const handleSaveAndNext = useCallback(
    () => handleSaveAndNavigate(1),
    [handleSaveAndNavigate],
  );

  // ↑↓ 키 네비게이션: 저장 후 같은 열의 위/아래 셀로 이동
  const handleSaveAndNavigateVertical = useCallback(
    (delta: 1 | -1) => {
      saveCellText();
      const cell = selectedCellRef.current;
      if (!cell) return;
      const nextCell = getVerticalAdjacentCell(cell, delta);
      setSelectedCell(nextCell);
      editingTextRef.current = getTopic(
        topicTreeRef.current,
        nextCell.gridIdx,
        nextCell.gridItemIdx,
      ).text;
    },
    [saveCellText],
  );

  const handleSaveAndUp = useCallback(
    () => handleSaveAndNavigateVertical(-1),
    [handleSaveAndNavigateVertical],
  );

  const handleSaveAndDown = useCallback(
    () => handleSaveAndNavigateVertical(1),
    [handleSaveAndNavigateVertical],
  );

  // 입력 바/팝오버 닫기: 저장 후 선택 해제
  const handleSaveAndClose = useCallback(() => {
    saveCellText();
    setSelectedCell(null);
  }, [saveCellText]);

  // 그리드 바깥 클릭 시 편집 종료 (모바일 전용 — 데스크톱은 Popover의 onInteractOutside에서 처리)
  const handleRootPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedCellRef.current || isDesktop) return;
      const target = e.target as HTMLElement;
      // 셀 클릭이면 handleSelectCell이 처리, 입력 바 클릭이면 무시
      if (
        target.closest('[data-cell]') ||
        target.closest('[data-bottom-input]')
      )
        return;
      handleSaveAndClose();
    },
    [isDesktop, handleSaveAndClose],
  );

  // 뷰 전환: 현재 편집 저장 후 선택 해제
  const handleViewToggle = useCallback(
    (val: boolean) => {
      saveCellText();
      setSelectedCell(null);
      setIsAllView(val);
      trackViewModeChange(val ? 'all' : 'focus');
    },
    [saveCellText],
  );

  const mandalartProps: MandalartProps = {
    onGetTopic: handleGetTopic,
    onSelectCell: handleSelectCell,
    selectedCell,
    usePopoverAnchor: isDesktop,
  };

  // 입력 바/팝오버에 전달할 값 계산
  const cellKey = selectedCell
    ? `${selectedCell.gridIdx}-${selectedCell.gridItemIdx}`
    : '';
  const initialText = selectedCell
    ? getTopic(topicTree, selectedCell.gridIdx, selectedCell.gridItemIdx).text
    : '';
  const cellPosition = selectedCell
    ? getCellPosition(selectedCell, isAllView)
    : '';

  const cellInputProps = {
    initialText,
    cellKey,
    cellPosition,
    onTextChange: handleEditingTextChange,
    onSaveAndPrev: handleSaveAndPrev,
    onSaveAndNext: handleSaveAndNext,
    onSaveAndUp: handleSaveAndUp,
    onSaveAndDown: handleSaveAndDown,
    onSaveAndClose: handleSaveAndClose,
  };

  const gridView = isAllView ? (
    <Mandalart {...mandalartProps} />
  ) : (
    <MandalartFocusView
      {...mandalartProps}
      onFocusedGridChange={handleFocusedGridChange}
    />
  );

  return (
    <div
      ref={rootRef}
      className={className}
      onPointerDown={handleRootPointerDown}
      {...rest}
    >
      <div className="relative">
        {mandalartId === TMP_MANDALART_ID && (
          <p className="absolute bottom-full text-sm text-muted-foreground">
            ({t('mandalart.temp')})
          </p>
        )}
        <div className="flex items-center gap-3">
          {titleEdit.isEditing ? (
            <div className="min-w-0 flex-1">
              <input
                ref={titleEdit.inputRef}
                type="text"
                value={titleEdit.titleText}
                onChange={titleEdit.handleChange}
                onKeyDown={titleEdit.handleKeyDown}
                onBlur={titleEdit.save}
                placeholder={t('mandalart.untitled')}
                enterKeyHint="done"
                autoComplete="off"
                aria-invalid={titleEdit.isLimitReached || undefined}
                className={cn(
                  'w-full rounded-md border border-input bg-transparent px-1 text-2xl font-semibold outline-none transition-colors',
                  'placeholder:text-muted-foreground',
                  'focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50',
                  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                )}
              />
              {titleEdit.isLimitReached && (
                <p className="mt-0.5 text-xs text-destructive">
                  {t('topic.maxLengthReached')} ({titleEdit.titleText.length}/
                  {MAX_MANDALART_TITLE_SIZE})
                </p>
              )}
            </div>
          ) : (
            <h2
              role="button"
              tabIndex={0}
              className="min-w-0 flex-1 cursor-pointer truncate rounded-md px-1 text-2xl font-semibold hover:bg-accent/50"
              onClick={titleEdit.start}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  titleEdit.start();
                }
              }}
            >
              {meta.title ? meta.title : t('mandalart.untitled')}
            </h2>
          )}
          <MandalartViewToggle
            isAllView={isAllView}
            onChange={handleViewToggle}
          />
        </div>
      </div>
      <div className="mb-2 mt-3">
        {isDesktop ? (
          // 데스크톱: Popover로 감싸서 선택된 셀 근처에 입력 UI 표시
          // TopicItem 내부의 PopoverAnchor가 앵커 역할을 함
          <Popover open={!!selectedCell}>
            {gridView}
            <PopoverContent
              side="bottom"
              align="center"
              sideOffset={8}
              className="w-80"
              // 셀 클릭 시 팝오버 유지, 그 외 바깥 클릭 시 편집 종료
              onInteractOutside={(e) => {
                e.preventDefault();
                const target = e.target as HTMLElement;
                if (!target.closest('[data-cell]')) {
                  handleSaveAndClose();
                }
              }}
              // Radix의 자동 포커스 이동을 방지 — PopoverCellInput이 직접 포커스 관리
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <PopoverCellInput {...cellInputProps} />
            </PopoverContent>
          </Popover>
        ) : (
          gridView
        )}
      </div>
      {/* 모바일: 하단 고정 입력 바 */}
      {!isDesktop && selectedCell && <BottomInputBar {...cellInputProps} />}
    </div>
  );
};

export default MandalartView;
