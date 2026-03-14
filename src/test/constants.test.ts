import { describe, it, expect } from 'vitest';
import {
  TABLE_SIZE,
  TABLE_CENTER_IDX,
  EMPTY_META,
  EMPTY_TOPIC_TREE,
  MAX_MANDALART_TITLE_SIZE,
  MAX_TOPIC_TEXT_SIZE,
} from 'constants/constants';

describe('만다라트 상수', () => {
  it('TABLE_SIZE는 9여야 한다', () => {
    expect(TABLE_SIZE).toBe(9);
  });

  it('TABLE_CENTER_IDX는 4여야 한다', () => {
    expect(TABLE_CENTER_IDX).toBe(4);
  });

  it('EMPTY_META는 빈 title을 가져야 한다', () => {
    expect(EMPTY_META.title).toBe('');
  });

  it('EMPTY_TOPIC_TREE는 올바른 2단계 트리 구조여야 한다', () => {
    // 최상위: text가 비어있어야 함
    expect(EMPTY_TOPIC_TREE.text).toBe('');
    // 1레벨 자식: TABLE_SIZE - 1 = 8개
    expect(EMPTY_TOPIC_TREE.children).toHaveLength(TABLE_SIZE - 1);
    // 2레벨 자식: 각각 TABLE_SIZE - 1 = 8개, 그 아래는 빈 배열
    EMPTY_TOPIC_TREE.children.forEach((child) => {
      expect(child.text).toBe('');
      expect(child.children).toHaveLength(TABLE_SIZE - 1);
      child.children.forEach((grandchild) => {
        expect(grandchild.text).toBe('');
        expect(grandchild.children).toHaveLength(0);
      });
    });
  });

  it('MAX_MANDALART_TITLE_SIZE는 50이어야 한다', () => {
    expect(MAX_MANDALART_TITLE_SIZE).toBe(50);
  });

  it('MAX_TOPIC_TEXT_SIZE는 50이어야 한다', () => {
    expect(MAX_TOPIC_TEXT_SIZE).toBe(50);
  });
});
