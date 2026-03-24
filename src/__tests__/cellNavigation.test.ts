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
      const next = getAdjacentCell({ gridIdx: 4, gridItemIdx: 4 }, 1, true);
      expect(next).toEqual({ gridIdx: 4, gridItemIdx: 0 });
    });

    it('All View에서 이전 셀로 이동한다', () => {
      const prev = getAdjacentCell({ gridIdx: 4, gridItemIdx: 4 }, -1, true);
      expect(prev).toEqual({ gridIdx: 8, gridItemIdx: 8 });
    });

    it('All View에서 그룹 경계를 넘어 다음 그룹으로 이동한다', () => {
      const next = getAdjacentCell({ gridIdx: 4, gridItemIdx: 8 }, 1, true);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 4 });
    });

    it('Focus View에서 현재 그룹 내에서만 순회한다', () => {
      const next = getAdjacentCell({ gridIdx: 2, gridItemIdx: 4 }, 1, false);
      expect(next.gridIdx).toBe(2);
    });

    it('Focus View에서 마지막 셀 → 첫 셀로 순환한다', () => {
      const next = getAdjacentCell({ gridIdx: 0, gridItemIdx: 8 }, 1, false);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 4 });
    });
  });

  describe('getVerticalAdjacentCell', () => {
    it('같은 열의 아래 셀로 이동한다', () => {
      const next = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 0 }, 1);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 3 });
    });

    it('같은 열의 위 셀로 이동한다', () => {
      const prev = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 3 }, -1);
      expect(prev).toEqual({ gridIdx: 0, gridItemIdx: 0 });
    });

    it('마지막 행에서 아래로 가면 첫 행으로 순환한다', () => {
      const next = getVerticalAdjacentCell({ gridIdx: 0, gridItemIdx: 6 }, 1);
      expect(next).toEqual({ gridIdx: 0, gridItemIdx: 0 });
    });
  });

  describe('getCellPosition', () => {
    it('All View에서 위치 문자열을 반환한다', () => {
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
