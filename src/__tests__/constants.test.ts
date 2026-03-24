import { describe, it, expect } from 'vitest';
import {
  TABLE_SIZE,
  TABLE_CENTER_IDX,
  createEmptyMeta,
  createEmptyTopicTree,
  MAX_MANDALART_TITLE_SIZE,
  MAX_TOPIC_TEXT_SIZE,
} from '@/constants';

describe('만다라트 상수', () => {
  it('TABLE_SIZE는 9여야 한다', () => {
    expect(TABLE_SIZE).toBe(9);
  });

  it('TABLE_CENTER_IDX는 4여야 한다', () => {
    expect(TABLE_CENTER_IDX).toBe(4);
  });

  it('createEmptyMeta는 빈 title을 가진 새 객체를 반환해야 한다', () => {
    const meta = createEmptyMeta();
    expect(meta.title).toBe('');
  });

  it('createEmptyMeta는 매번 새 객체를 반환해야 한다', () => {
    const a = createEmptyMeta();
    const b = createEmptyMeta();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('createEmptyTopicTree는 올바른 2단계 트리 구조를 반환해야 한다', () => {
    const tree = createEmptyTopicTree();
    // 최상위: text가 비어있어야 함
    expect(tree.text).toBe('');
    // 1레벨 자식: TABLE_SIZE - 1 = 8개
    expect(tree.children).toHaveLength(TABLE_SIZE - 1);
    // 2레벨 자식: 각각 TABLE_SIZE - 1 = 8개, 그 아래는 빈 배열
    tree.children.forEach((child) => {
      expect(child.text).toBe('');
      expect(child.children).toHaveLength(TABLE_SIZE - 1);
      child.children.forEach((grandchild) => {
        expect(grandchild.text).toBe('');
        expect(grandchild.children).toHaveLength(0);
      });
    });
  });

  it('createEmptyTopicTree는 매번 새 객체를 반환해야 한다', () => {
    const a = createEmptyTopicTree();
    const b = createEmptyTopicTree();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('MAX_MANDALART_TITLE_SIZE는 50이어야 한다', () => {
    expect(MAX_MANDALART_TITLE_SIZE).toBe(50);
  });

  it('MAX_TOPIC_TEXT_SIZE는 50이어야 한다', () => {
    expect(MAX_TOPIC_TEXT_SIZE).toBe(50);
  });
});
