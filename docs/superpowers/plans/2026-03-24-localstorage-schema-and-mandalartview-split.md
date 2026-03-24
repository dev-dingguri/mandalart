# localStorage 스키마 버전 관리 + MandalartView 분할 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 게스트 localStorage 데이터에 스키마 버전을 추가하여 향후 타입 변경 시 안전한 마이그레이션을 보장하고, MandalartView(535줄)에서 셀 네비게이션 유틸리티와 제목 편집 로직을 분리하여 유지보수성을 개선한다.

**Architecture:** 두 독립 작업으로 구성. (1) localStorage 저장 형식을 `{ version, data }` 래퍼로 감싸고, 기존 데이터(버전 없음)는 v1으로 자동 마이그레이션. 마이그레이션 레지스트리 패턴으로 향후 버전 추가를 쉽게 확장. (2) MandalartView에서 순수 함수(셀 네비게이션)를 별도 모듈로, 제목 편집 상태/로직을 커스텀 훅으로 추출.

**Tech Stack:** TypeScript, Vitest, Zustand, React

---

## 파일 구조

### Task 1: localStorage 스키마 버전 관리

| 동작 | 파일 | 책임 |
|------|------|------|
| Create | `src/lib/guestStorage.ts` | 버전 래퍼, 마이그레이션 레지스트리, load/save 함수 |
| Create | `src/test/guestStorage.test.ts` | guestStorage 단위 테스트 |
| Modify | `src/stores/useMandalartStore.ts` | 기존 localStorage 헬퍼 → guestStorage 함수로 교체 |
| Modify | `src/constants/storage.ts` | 불필요한 상수 정리 여부 확인 (변경 없을 수 있음) |

### Task 2: MandalartView 분할

| 동작 | 파일 | 책임 |
|------|------|------|
| Create | `src/lib/cellNavigation.ts` | 셀 순회 순서, getAdjacentCell, getVerticalAdjacentCell, getCellPosition, getTopic |
| Create | `src/test/cellNavigation.test.ts` | 셀 네비게이션 단위 테스트 |
| Create | `src/hooks/useTitleEdit.ts` | 제목 편집 상태(isEditing, titleText) + 핸들러(start, save, cancel, keyDown, change) |
| Modify | `src/components/MandalartView.tsx` | 추출된 모듈/훅을 import하여 사용, 기존 인라인 코드 제거 |

---

## Task 1: localStorage 스키마 버전 관리

### Task 1.1: guestStorage 모듈 테스트 작성

**Files:**
- Create: `src/test/guestStorage.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadGuestMandalartMetas,
  saveGuestMandalartMetas,
  loadGuestTopicTrees,
  saveGuestTopicTrees,
  CURRENT_SCHEMA_VERSION,
} from '@/lib/guestStorage';
import { STORAGE_KEY_SNIPPETS, STORAGE_KEY_TOPIC_TREES } from '@/constants';
import { MandalartMeta, TopicNode } from '@/types';

const sampleMeta: MandalartMeta = { title: '목표' };
const sampleTree: TopicNode = {
  text: '핵심',
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
};

describe('guestStorage', () => {
  beforeEach(() => localStorage.clear());

  describe('round-trip', () => {
    it('save → load로 MandalartMeta를 정확히 복원한다', () => {
      const map = new Map([['id1', sampleMeta]]);
      saveGuestMandalartMetas(map);
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(map);
    });

    it('save → load로 TopicNode를 정확히 복원한다', () => {
      const map = new Map([['id1', sampleTree]]);
      saveGuestTopicTrees(map);
      const loaded = loadGuestTopicTrees();
      expect(loaded).toEqual(map);
    });
  });

  describe('버전 없는 레거시 데이터 마이그레이션', () => {
    it('버전 래퍼 없이 직접 저장된 snippets를 v1으로 마이그레이션한다', () => {
      // 기존 형식: { id: MandalartMeta } (래퍼 없음)
      localStorage.setItem(
        STORAGE_KEY_SNIPPETS,
        JSON.stringify({ id1: sampleMeta }),
      );
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(new Map([['id1', sampleMeta]]));
    });

    it('버전 래퍼 없이 직접 저장된 topictrees를 v1으로 마이그레이션한다', () => {
      localStorage.setItem(
        STORAGE_KEY_TOPIC_TREES,
        JSON.stringify({ id1: sampleTree }),
      );
      const loaded = loadGuestTopicTrees();
      expect(loaded).toEqual(new Map([['id1', sampleTree]]));
    });

    it('마이그레이션 후 저장된 데이터에 버전 래퍼가 포함된다', () => {
      localStorage.setItem(
        STORAGE_KEY_SNIPPETS,
        JSON.stringify({ id1: sampleMeta }),
      );
      loadGuestMandalartMetas(); // 마이그레이션 트리거
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_SNIPPETS)!);
      expect(raw.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(raw.data).toEqual({ id1: sampleMeta });
    });
  });

  describe('손상된 데이터 처리', () => {
    it('파싱 불가한 데이터에서 빈 Map을 반환한다', () => {
      localStorage.setItem(STORAGE_KEY_SNIPPETS, 'not json');
      expect(loadGuestMandalartMetas()).toEqual(new Map());
    });

    it('null 값에서 빈 Map을 반환한다', () => {
      expect(loadGuestMandalartMetas()).toEqual(new Map());
    });
  });

  describe('현재 버전 데이터', () => {
    it('현재 버전의 래퍼 데이터를 정상 로드한다', () => {
      const wrapped = {
        version: CURRENT_SCHEMA_VERSION,
        data: { id1: sampleMeta },
      };
      localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(wrapped));
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(new Map([['id1', sampleMeta]]));
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm vitest run src/test/guestStorage.test.ts`
Expected: FAIL — `@/lib/guestStorage` 모듈이 없으므로 import 에러

### Task 1.2: guestStorage 모듈 구현

**Files:**
- Create: `src/lib/guestStorage.ts`

- [ ] **Step 3: guestStorage 모듈 작성**

```typescript
import { MandalartMeta, TopicNode } from '@/types';
import { STORAGE_KEY_SNIPPETS, STORAGE_KEY_TOPIC_TREES } from '@/constants';

// 현재 스키마 버전 — 타입 구조 변경 시 올리고 마이그레이션 함수 추가
export const CURRENT_SCHEMA_VERSION = 1;

type VersionedData<T> = {
  version: number;
  data: Record<string, T>;
};

// 마이그레이션 레지스트리: 키는 "from version", 값은 data를 변환하는 함수
// 예: 향후 MandalartMeta에 color 필드를 추가하면
//   migrations[1] = (data) => mapValues(data, m => ({ ...m, color: 'default' }))
// 후 CURRENT_SCHEMA_VERSION을 2로 올린다.
type Migration<T> = (data: Record<string, T>) => Record<string, T>;

const metaMigrations: Record<number, Migration<MandalartMeta>> = {};
const treeMigrations: Record<number, Migration<TopicNode>> = {};

function load<T>(
  key: string,
  migrations: Record<number, Migration<T>>,
): Map<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();

    const parsed = JSON.parse(raw);

    let version: number;
    let data: Record<string, T>;

    if (parsed && typeof parsed.version === 'number' && parsed.data) {
      // 버전 래퍼가 있는 새 형식
      version = parsed.version;
      data = parsed.data;
    } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      // 버전 래퍼 없는 레거시 형식 → v1으로 취급
      version = 1;
      data = parsed;
    } else {
      return new Map();
    }

    // 순차적 마이그레이션 적용
    while (version < CURRENT_SCHEMA_VERSION) {
      const migrate = migrations[version];
      if (!migrate) break; // 마이그레이션 함수가 없으면 중단 (데이터 보존)
      data = migrate(data);
      version++;
    }

    // 레거시 형식이거나 마이그레이션이 발생했으면 새 형식으로 재저장
    const isLegacy = typeof parsed.version !== 'number';
    if (isLegacy || version !== parsed.version) {
      save(key, new Map(Object.entries(data)));
    }

    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function save<T>(key: string, map: Map<string, T>): void {
  const wrapped: VersionedData<T> = {
    version: CURRENT_SCHEMA_VERSION,
    data: Object.fromEntries(map),
  };
  localStorage.setItem(key, JSON.stringify(wrapped));
}

// -- Public API --

export const loadGuestMandalartMetas = (): Map<string, MandalartMeta> =>
  load<MandalartMeta>(STORAGE_KEY_SNIPPETS, metaMigrations);

export const saveGuestMandalartMetas = (
  map: Map<string, MandalartMeta>,
): void => save(STORAGE_KEY_SNIPPETS, map);

export const loadGuestTopicTrees = (): Map<string, TopicNode> =>
  load<TopicNode>(STORAGE_KEY_TOPIC_TREES, treeMigrations);

export const saveGuestTopicTrees = (map: Map<string, TopicNode>): void =>
  save(STORAGE_KEY_TOPIC_TREES, map);
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm vitest run src/test/guestStorage.test.ts`
Expected: ALL PASS

### Task 1.3: useMandalartStore에서 guestStorage 사용

**Files:**
- Modify: `src/stores/useMandalartStore.ts:27-64` (localStorage 헬퍼 제거, import 교체)

- [ ] **Step 5: useMandalartStore의 로컬 헬퍼를 guestStorage import로 교체**

변경 내용:
1. 파일 상단 import에 `guestStorage` 추가:
   ```typescript
   import {
     loadGuestMandalartMetas,
     saveGuestMandalartMetas,
     loadGuestTopicTrees,
     saveGuestTopicTrees,
   } from '@/lib/guestStorage';
   ```
2. `STORAGE_KEY_SNIPPETS`, `STORAGE_KEY_TOPIC_TREES`를 import에서 제거 (guestStorage 내부에서 사용)
3. 기존 로컬 함수 4개 삭제 (라인 29-64의 `loadGuestMandalartMetas`, `saveGuestMandalartMetas`, `loadGuestTopicTrees`, `saveGuestTopicTrees` 및 TODO 주석)

- [ ] **Step 6: 기존 테스트 + 빌드 확인**

Run: `pnpm vitest run && pnpm build`
Expected: ALL PASS, 빌드 성공

- [ ] **Step 7: 커밋**

```bash
git add src/lib/guestStorage.ts src/test/guestStorage.test.ts src/stores/useMandalartStore.ts
git commit -m "feat: guest localStorage 데이터에 스키마 버전 관리 추가

버전 래퍼({ version, data }) 형식으로 저장하고, 기존 레거시 데이터는
자동으로 v1으로 마이그레이션한다. 마이그레이션 레지스트리 패턴으로
향후 타입 변경 시 순차적 마이그레이션을 지원한다."
```

---

## Task 2: MandalartView 분할

### Task 2.1: 셀 네비게이션 유틸리티 테스트 작성

**Files:**
- Create: `src/test/cellNavigation.test.ts`

- [ ] **Step 8: 셀 네비게이션 테스트 작성**

```typescript
import { describe, it, expect } from 'vitest';
import {
  getAdjacentCell,
  getVerticalAdjacentCell,
  getCellPosition,
  getTopic,
} from '@/lib/cellNavigation';
import { createEmptyTopicTree, TABLE_CENTER_IDX } from '@/constants';

describe('cellNavigation', () => {
  describe('getAdjacentCell', () => {
    it('All View에서 다음 셀로 이동한다', () => {
      // G4(중앙 그룹), idx 4(중앙 셀) → 다음은 G4, idx 0
      const next = getAdjacentCell({ gridIdx: 4, gridItemIdx: 4 }, 1, true);
      expect(next).toEqual({ gridIdx: 4, gridItemIdx: 0 });
    });

    it('All View에서 이전 셀로 이동한다', () => {
      // G4, idx 4(첫 셀) → 이전은 마지막 셀 (G8, idx 8)
      const prev = getAdjacentCell({ gridIdx: 4, gridItemIdx: 4 }, -1, true);
      expect(prev).toEqual({ gridIdx: 8, gridItemIdx: 8 });
    });

    it('All View에서 그룹 경계를 넘어 다음 그룹으로 이동한다', () => {
      // G4의 마지막 셀(idx 8) → 다음은 G0의 첫 셀(idx 4)
      const next = getAdjacentCell({ gridIdx: 4, gridItemIdx: 8 }, 1, true);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 4 });
    });

    it('Focus View에서 현재 그룹 내에서만 순회한다', () => {
      const next = getAdjacentCell({ gridIdx: 2, gridItemIdx: 4 }, 1, false);
      expect(next.gridIdx).toBe(2); // 같은 그룹 유지
    });

    it('Focus View에서 마지막 셀 → 첫 셀로 순환한다', () => {
      const next = getAdjacentCell({ gridIdx: 0, gridItemIdx: 8 }, 1, false);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 4 }); // 중앙 셀이 첫 순서
    });
  });

  describe('getVerticalAdjacentCell', () => {
    it('같은 열의 아래 셀로 이동한다', () => {
      // idx 0 (row 0, col 0) → 아래: idx 3 (row 1, col 0)
      const next = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 0 }, 1);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 3 });
    });

    it('같은 열의 위 셀로 이동한다', () => {
      // idx 3 (row 1, col 0) → 위: idx 0 (row 0, col 0)
      const prev = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 3 }, -1);
      expect(prev).toEqual({ gridIdx: 0, gridItemIdx: 0 });
    });

    it('마지막 행에서 아래로 가면 첫 행으로 순환한다', () => {
      // idx 6 (row 2, col 0) → 아래: idx 0 (row 0, col 0)
      const next = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 6 }, 1);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 0 });
    });
  });

  describe('getCellPosition', () => {
    it('All View에서 위치 문자열을 반환한다', () => {
      // G4(pos 0), idx 4(pos 0) → "1/81"
      const pos = getCellPosition({ gridIdx: 4, gridItemIdx: 4 }, true);
      expect(pos).toBe('1/81');
    });

    it('Focus View에서 그룹 내 위치 문자열을 반환한다', () => {
      const pos = getCellPosition({ gridIdx: 0, gridItemIdx: 4 }, false);
      expect(pos).toBe('1/9');
    });
  });

  describe('getTopic', () => {
    it('중앙 그리드의 중앙 셀 → 루트 노드를 반환한다', () => {
      const tree = createEmptyTopicTree();
      tree.text = '핵심목표';
      const node = getTopic(tree, TABLE_CENTER_IDX, TABLE_CENTER_IDX);
      expect(node.text).toBe('핵심목표');
    });

    it('중앙 그리드의 주변 셀 → level-1 자식을 반환한다', () => {
      const tree = createEmptyTopicTree();
      tree.children[0].text = '하위1';
      const node = getTopic(tree, TABLE_CENTER_IDX, 0);
      expect(node.text).toBe('하위1');
    });

    it('주변 그리드의 중앙 셀 → level-1 자식(미러)을 반환한다', () => {
      const tree = createEmptyTopicTree();
      tree.children[0].text = '하위1';
      const node = getTopic(tree, 0, TABLE_CENTER_IDX);
      expect(node.text).toBe('하위1');
    });

    it('주변 그리드의 주변 셀 → level-2 자식을 반환한다', () => {
      const tree = createEmptyTopicTree();
      tree.children[0].children[0].text = '세부1';
      const node = getTopic(tree, 0, 0);
      expect(node.text).toBe('세부1');
    });
  });
});
```

- [ ] **Step 9: 테스트 실패 확인**

Run: `pnpm vitest run src/test/cellNavigation.test.ts`
Expected: FAIL — `@/lib/cellNavigation` 모듈 없음

### Task 2.2: 셀 네비게이션 모듈 추출

**Files:**
- Create: `src/lib/cellNavigation.ts`
- Modify: `src/components/MandalartView.tsx:43-113, 518-533` (해당 코드 제거, import 추가)

- [ ] **Step 10: cellNavigation 모듈 작성**

`MandalartView.tsx`의 라인 43–113 (`GROUP_ORDER`, `CELL_ORDER`, `GROUP_POS`, `CELL_POS`, `getAdjacentCell`, `getVerticalAdjacentCell`, `getCellPosition`)과 라인 518–533 (`getTopic`)을 그대로 옮긴다.

```typescript
import {
  TABLE_SIZE,
  TABLE_COL_SIZE,
  TABLE_ROW_SIZE,
  TABLE_CENTER_IDX,
} from '@/constants';
import { TopicNode } from '@/types';

export type SelectedCell = {
  gridIdx: number;
  gridItemIdx: number;
};

const TOTAL_CELLS = TABLE_SIZE * TABLE_SIZE; // 81

// 그룹 순회 순서: 중앙 그룹(G4) 먼저 → 나머지 읽기 순서
// 만다라트는 중심에서 확장하는 구조이므로 핵심 목표 그룹부터 시작
const GROUP_ORDER = [4, 0, 1, 2, 3, 5, 6, 7, 8] as const;

// 그룹 내 셀 순회 순서: 중앙 셀(idx 4, 그룹 주제) 먼저 → 나머지 읽기 순서
// 각 그룹의 주제를 먼저 확인/작성한 뒤 세부 항목을 채움
const CELL_ORDER = [4, 0, 1, 2, 3, 5, 6, 7, 8] as const;

// 역방향 매핑: 실제 인덱스 → 순회 순서 내 위치 (O(1) 조회)
const GROUP_POS: Record<number, number> = {};
GROUP_ORDER.forEach((g, i) => {
  GROUP_POS[g] = i;
});
const CELL_POS: Record<number, number> = {};
CELL_ORDER.forEach((c, i) => {
  CELL_POS[c] = i;
});

export function getAdjacentCell(
  cell: SelectedCell,
  delta: 1 | -1,
  isAllView: boolean,
): SelectedCell {
  const cellPos = CELL_POS[cell.gridItemIdx];
  if (isAllView) {
    // All View: 그룹 단위 순회 — 그룹 내 셀을 다 돌면 다음 그룹으로 이동
    const groupPos = GROUP_POS[cell.gridIdx];
    const combined = groupPos * TABLE_SIZE + cellPos;
    const newCombined = (combined + delta + TOTAL_CELLS) % TOTAL_CELLS;
    return {
      gridIdx: GROUP_ORDER[Math.floor(newCombined / TABLE_SIZE)],
      gridItemIdx: CELL_ORDER[newCombined % TABLE_SIZE],
    };
  }
  // Focus View: 현재 그리드 내에서만 순회 (같은 중앙 우선 순서)
  const newCellPos = (cellPos + delta + TABLE_SIZE) % TABLE_SIZE;
  return {
    gridIdx: cell.gridIdx,
    gridItemIdx: CELL_ORDER[newCellPos],
  };
}

// ↑↓ 키로 같은 그룹 내 같은 열의 위/아래 셀로 이동 (시각적 2D 네비게이션)
// All View와 Focus View 모두 현재 그룹 내에서만 이동 — 그룹 기반 멘탈 모델 유지
export function getVerticalAdjacentCell(
  cell: SelectedCell,
  delta: 1 | -1,
): SelectedCell {
  const row = Math.floor(cell.gridItemIdx / TABLE_COL_SIZE);
  const col = cell.gridItemIdx % TABLE_COL_SIZE;
  const newRow = (row + delta + TABLE_ROW_SIZE) % TABLE_ROW_SIZE;
  return {
    gridIdx: cell.gridIdx,
    gridItemIdx: newRow * TABLE_COL_SIZE + col,
  };
}

export function getCellPosition(
  cell: SelectedCell,
  isAllView: boolean,
): string {
  if (isAllView) {
    const groupPos = GROUP_POS[cell.gridIdx];
    const cellPos = CELL_POS[cell.gridItemIdx];
    return `${groupPos * TABLE_SIZE + cellPos + 1}/${TOTAL_CELLS}`;
  }
  return `${CELL_POS[cell.gridItemIdx] + 1}/${TABLE_SIZE}`;
}

export function getTopic(
  topicTree: TopicNode,
  gridIdx: number,
  gridItemIdx: number,
): TopicNode {
  let node = topicTree;
  [gridIdx, gridItemIdx].forEach((idx) => {
    if (idx !== TABLE_CENTER_IDX) {
      node = node.children[idx < TABLE_CENTER_IDX ? idx : idx - 1];
    }
  });
  if (!node) {
    throw new Error('Cannot get topicNode.');
  }
  return node;
}
```

- [ ] **Step 11: 테스트 통과 확인**

Run: `pnpm vitest run src/test/cellNavigation.test.ts`
Expected: ALL PASS

### Task 2.3: useTitleEdit 훅 추출

**Files:**
- Create: `src/hooks/useTitleEdit.ts`

- [ ] **Step 12: useTitleEdit 훅 작성**

```typescript
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from 'react';
import { MAX_MANDALART_TITLE_SIZE } from '@/constants';

type UseTitleEditParams = {
  mandalartId: string;
  metaTitle: string;
  onMandalartMetaChange: (meta: { title: string }) => void;
};

export function useTitleEdit({
  mandalartId,
  metaTitle,
  onMandalartMetaChange,
}: UseTitleEditParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleText, setTitleText] = useState(metaTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  // 만다라트 전환 시 편집 취소
  useEffect(() => {
    setIsEditing(false);
  }, [mandalartId]);

  // 외부에서 title이 바뀌면(Firebase 실시간 구독 등) 편집 중이 아닐 때만 동기화
  useEffect(() => {
    if (!isEditing) setTitleText(metaTitle);
  }, [metaTitle, isEditing]);

  // 편집 모드 진입 시 input 포커스 + 전체 선택
  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }
  }, [isEditing]);

  const start = useCallback(() => {
    setTitleText(metaTitle);
    setIsEditing(true);
  }, [metaTitle]);

  const save = useCallback(() => {
    setIsEditing(false);
    if (titleText !== metaTitle && titleText.length <= MAX_MANDALART_TITLE_SIZE) {
      onMandalartMetaChange({ title: titleText });
    }
  }, [titleText, metaTitle, onMandalartMetaChange]);

  const cancel = useCallback(() => {
    setIsEditing(false);
    setTitleText(metaTitle);
  }, [metaTitle]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
    },
    [save, cancel],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setTitleText(e.target.value);
  }, []);

  const isLimitReached = titleText.length > MAX_MANDALART_TITLE_SIZE;

  return {
    isEditing,
    titleText,
    inputRef,
    isLimitReached,
    start,
    save,
    cancel,
    handleKeyDown,
    handleChange,
  };
}
```

### Task 2.4: MandalartView에서 추출된 코드 제거 및 import 교체

**Files:**
- Modify: `src/components/MandalartView.tsx`
- Modify: `src/components/Mandalart.tsx` (SelectedCell 타입 re-export 변경)

- [ ] **Step 13: MandalartView.tsx 리팩토링**

변경 사항 (정확한 순서대로):

**13-a. `Mandalart.tsx`에서 `SelectedCell` re-export 변경**
`Mandalart.tsx`에서 `SelectedCell` 로컬 타입 정의를 제거하고 `@/lib/cellNavigation`에서 import + re-export:
```typescript
export type { SelectedCell } from '@/lib/cellNavigation';
```
다른 파일(`MandalartFocusView.tsx` 등)은 `import { SelectedCell } from '@/components/Mandalart'`를 계속 사용하므로 수정 불필요.

**13-b. `MandalartView.tsx` import 변경**
- 추가할 import:
  ```typescript
  import { getAdjacentCell, getVerticalAdjacentCell, getCellPosition, getTopic } from '@/lib/cellNavigation';
  import { useTitleEdit } from '@/hooks/useTitleEdit';
  ```
- `SelectedCell` import 소스를 `@/components/Mandalart` → `@/lib/cellNavigation`으로 변경 (또는 `@/components/Mandalart`의 re-export를 계속 사용해도 됨)
- `@/constants` import에서 제거: `TABLE_CENTER_IDX`, `TABLE_COL_SIZE`, `TABLE_ROW_SIZE`, `TABLE_SIZE` (cellNavigation 내부에서만 사용)
- `@/constants` import에서 유지: `MAX_MANDALART_TITLE_SIZE` (JSX에서 `{MAX_MANDALART_TITLE_SIZE}` 직접 표시), `MAX_TOPIC_TEXT_SIZE`, `TMP_MANDALART_ID`
- React import에서 제거: `KeyboardEvent`, `ChangeEvent` (useTitleEdit로 이동)
- React import에서 유지: `useCallback`, `HTMLAttributes`, `useState`, `useRef`, `useEffect` (다른 곳에서 사용)

**13-c. 네비게이션 유틸리티 코드 삭제**
- 라인 43–113: `TOTAL_CELLS`, `GROUP_ORDER`, `CELL_ORDER`, `GROUP_POS`, `CELL_POS`, `getAdjacentCell`, `getVerticalAdjacentCell`, `getCellPosition` 삭제
- 라인 518–533: `getTopic` 함수 삭제

**13-d. 제목 편집 코드를 `useTitleEdit` 호출로 교체**
MandalartView 컴포넌트 내부에서:
- 제거 대상 (라인 128–196):
  - `const [isEditingTitle, setIsEditingTitle] = useState(false);`
  - `const [titleText, setTitleText] = useState(meta.title);`
  - `const titleInputRef = useRef<HTMLInputElement>(null);`
  - 세 개의 `useEffect` (만다라트 전환 시 편집 취소, 외부 title 동기화, input 포커스)
  - `startTitleEdit`, `saveTitleEdit`, `cancelTitleEdit`, `handleTitleKeyDown`, `handleTitleChange` 함수
  - `isTitleLimitReached` 계산

- 대체 코드:
  ```typescript
  const titleEdit = useTitleEdit({
    mandalartId,
    metaTitle: meta.title,
    onMandalartMetaChange,
  });
  ```

**13-e. JSX에서 제목 편집 참조 교체**
| 기존 | 변경 |
|------|------|
| `isEditingTitle` | `titleEdit.isEditing` |
| `titleText` | `titleEdit.titleText` |
| `ref={titleInputRef}` | `ref={titleEdit.inputRef}` |
| `onChange={handleTitleChange}` | `onChange={titleEdit.handleChange}` |
| `onKeyDown={handleTitleKeyDown}` | `onKeyDown={titleEdit.handleKeyDown}` |
| `onBlur={saveTitleEdit}` | `onBlur={titleEdit.save}` |
| `onClick={startTitleEdit}` | `onClick={titleEdit.start}` |
| `isTitleLimitReached` | `titleEdit.isLimitReached` |
| JSX 키보드 `startTitleEdit()` | `titleEdit.start()` |

`MAX_MANDALART_TITLE_SIZE`와 `titleEdit.titleText.length`는 JSX에서 직접 사용.

- [ ] **Step 15: 전체 테스트 + 빌드 확인**

Run: `pnpm vitest run && pnpm build`
Expected: ALL PASS, 빌드 성공

- [ ] **Step 16: 커밋**

```bash
git add src/lib/cellNavigation.ts src/test/cellNavigation.test.ts src/hooks/useTitleEdit.ts src/components/MandalartView.tsx src/components/Mandalart.tsx
git commit -m "refactor: MandalartView에서 셀 네비게이션 유틸리티와 제목 편집 훅 분리

셀 순회 로직(getAdjacentCell 등)을 src/lib/cellNavigation.ts로,
제목 편집 상태/핸들러를 useTitleEdit 훅으로 추출하여
MandalartView의 책임을 줄이고 단위 테스트 가능성을 확보한다."
```

---

## 완료 후 정리

- [ ] **Step 17: TODO 주석 제거 확인**

`src/stores/useMandalartStore.ts`의 라인 29-31 TODO 주석(`client-localstorage-schema`)이 Step 5에서 제거되었는지 확인.

- [ ] **Step 18: feature-spec.md Known Issues 업데이트**

`docs/feature-spec.md`의 307줄 "게스트 localStorage 스키마 버전 미관리" 항목을 제거 또는 완료 표시.

- [ ] **Step 19: firebase-react-sync-issues.md 업데이트**

`docs/firebase-react-sync-issues.md`의 "5. 게스트 localStorage 스키마 버전 관리 없음" 섹션에 해결 완료 표기.

- [ ] **Step 20: 문서 변경 커밋**

```bash
git add docs/feature-spec.md docs/firebase-react-sync-issues.md
git commit -m "docs: localStorage 스키마 버전 관리 완료 반영"
```
