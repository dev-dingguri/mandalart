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
      // 배열 접근 직후 guard — TypeScript가 범위 초과를 잡지 못하므로 런타임 방어
      const child = node.children[idx < TABLE_CENTER_IDX ? idx : idx - 1];
      if (!child) throw new Error(`Cannot get topicNode at idx ${idx}.`);
      node = child;
    }
  });
  return node;
}
