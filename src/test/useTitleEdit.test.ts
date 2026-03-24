import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTitleEdit } from '@/hooks/useTitleEdit';
import { MAX_MANDALART_TITLE_SIZE } from '@/constants';

const setup = (overrides = {}) => {
  const defaults = {
    mandalartId: 'id1',
    metaTitle: '기존 제목',
    onMandalartMetaChange: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  return renderHook(({ ...p }) => useTitleEdit(p), {
    initialProps: props,
  });
};

describe('useTitleEdit', () => {
  describe('초기 상태', () => {
    it('isEditing=false, titleText=metaTitle', () => {
      const { result } = setup();
      expect(result.current.isEditing).toBe(false);
      expect(result.current.titleText).toBe('기존 제목');
    });
  });

  describe('start / cancel', () => {
    it('start() 호출 시 편집 모드 진입', () => {
      const { result } = setup();
      act(() => result.current.start());
      expect(result.current.isEditing).toBe(true);
    });

    it('cancel() 호출 시 편집 취소 + titleText 원복', () => {
      const { result } = setup();
      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: '수정 중' } } as any));
      act(() => result.current.cancel());

      expect(result.current.isEditing).toBe(false);
      expect(result.current.titleText).toBe('기존 제목');
    });
  });

  describe('save', () => {
    it('변경된 제목을 저장하면 onMandalartMetaChange가 호출된다', () => {
      const onChange = vi.fn();
      const { result } = setup({ onMandalartMetaChange: onChange });

      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: '새 제목' } } as any));
      act(() => result.current.save());

      expect(onChange).toHaveBeenCalledWith({ title: '새 제목' });
      expect(result.current.isEditing).toBe(false);
    });

    it('제목이 변경되지 않으면 onMandalartMetaChange를 호출하지 않는다', () => {
      const onChange = vi.fn();
      const { result } = setup({ onMandalartMetaChange: onChange });

      act(() => result.current.start());
      // 같은 제목으로 save
      act(() => result.current.save());

      expect(onChange).not.toHaveBeenCalled();
    });

    it('글자수 제한 초과 시 onMandalartMetaChange를 호출하지 않는다', () => {
      const onChange = vi.fn();
      const { result } = setup({ onMandalartMetaChange: onChange });
      const overLimit = 'a'.repeat(MAX_MANDALART_TITLE_SIZE + 1);

      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: overLimit } } as any));
      act(() => result.current.save());

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('isLimitReached', () => {
    it('글자수 제한 이내면 false', () => {
      const { result } = setup({ metaTitle: 'a'.repeat(MAX_MANDALART_TITLE_SIZE) });
      expect(result.current.isLimitReached).toBe(false);
    });

    it('글자수 제한 초과 시 true', () => {
      const { result } = setup();
      act(() => result.current.start());
      act(() =>
        result.current.handleChange({
          target: { value: 'a'.repeat(MAX_MANDALART_TITLE_SIZE + 1) },
        } as any),
      );
      expect(result.current.isLimitReached).toBe(true);
    });
  });

  describe('handleKeyDown', () => {
    it('Enter 키로 저장한다', () => {
      const onChange = vi.fn();
      const { result } = setup({ onMandalartMetaChange: onChange });

      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: '엔터 저장' } } as any));
      act(() =>
        result.current.handleKeyDown({
          key: 'Enter',
          preventDefault: vi.fn(),
        } as any),
      );

      expect(onChange).toHaveBeenCalledWith({ title: '엔터 저장' });
      expect(result.current.isEditing).toBe(false);
    });

    it('Escape 키로 취소한다', () => {
      const onChange = vi.fn();
      const { result } = setup({ onMandalartMetaChange: onChange });

      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: '취소될 값' } } as any));
      act(() =>
        result.current.handleKeyDown({
          key: 'Escape',
          preventDefault: vi.fn(),
        } as any),
      );

      expect(onChange).not.toHaveBeenCalled();
      expect(result.current.isEditing).toBe(false);
      expect(result.current.titleText).toBe('기존 제목');
    });
  });

  describe('mandalartId 변경', () => {
    it('만다라트 전환 시 편집이 자동 취소된다', () => {
      const { result, rerender } = setup();

      act(() => result.current.start());
      expect(result.current.isEditing).toBe(true);

      rerender({
        mandalartId: 'id2',
        metaTitle: '다른 만다라트',
        onMandalartMetaChange: vi.fn(),
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('외부 metaTitle 변경', () => {
    it('편집 중이 아닐 때 외부 title 변경이 반영된다', () => {
      const { result, rerender } = setup();

      rerender({
        mandalartId: 'id1',
        metaTitle: '외부에서 변경됨',
        onMandalartMetaChange: vi.fn(),
      });

      expect(result.current.titleText).toBe('외부에서 변경됨');
    });

    it('편집 중일 때 외부 title 변경은 무시된다', () => {
      const { result, rerender } = setup();

      act(() => result.current.start());
      act(() => result.current.handleChange({ target: { value: '편집 중' } } as any));

      rerender({
        mandalartId: 'id1',
        metaTitle: '외부에서 변경됨',
        onMandalartMetaChange: vi.fn(),
      });

      // 편집 중인 값이 유지됨
      expect(result.current.titleText).toBe('편집 중');
    });
  });
});
