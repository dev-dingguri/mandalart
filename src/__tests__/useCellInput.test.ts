import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCellInput, CellInputConfig } from '@/hooks/useCellInput';
import { MAX_TOPIC_TEXT_SIZE } from '@/constants';

const setup = (overrides: Partial<CellInputConfig> = {}) => {
  const defaults: CellInputConfig = {
    initialText: '',
    cellKey: 'cell-0-0',
    onTextChange: vi.fn(),
    onSaveAndPrev: vi.fn(),
    onSaveAndNext: vi.fn(),
    onSaveAndUp: vi.fn(),
    onSaveAndDown: vi.fn(),
    onSaveAndClose: vi.fn(),
  };
  const props = { ...defaults, ...overrides };
  return {
    ...renderHook(({ ...p }) => useCellInput(p), { initialProps: props }),
    props,
  };
};

/** ChangeEvent<HTMLInputElement> 모킹 */
const changeEvent = (value: string) =>
  ({ target: { value } }) as React.ChangeEvent<HTMLInputElement>;

/** KeyboardEvent<HTMLInputElement> 모킹 */
const keyEvent = (key: string, extra: Record<string, boolean> = {}) =>
  ({
    key,
    shiftKey: false,
    preventDefault: vi.fn(),
    ...extra,
  }) as unknown as React.KeyboardEvent<HTMLInputElement>;

describe('useCellInput', () => {
  describe('초기 상태', () => {
    it('text가 initialText로 설정된다', () => {
      const { result } = setup({ initialText: '목표' });
      expect(result.current.text).toBe('목표');
    });

    it('마운트 시 onTextChange가 initialText로 호출된다', () => {
      const onTextChange = vi.fn();
      setup({ initialText: '초기값', onTextChange });
      expect(onTextChange).toHaveBeenCalledWith('초기값');
    });
  });

  describe('handleChange', () => {
    it('텍스트 입력 시 text가 갱신된다', () => {
      const { result } = setup();
      act(() => result.current.handleChange(changeEvent('새 값')));
      expect(result.current.text).toBe('새 값');
    });

    it('텍스트 입력 시 onTextChange가 호출된다', () => {
      const onTextChange = vi.fn();
      const { result } = setup({ onTextChange });
      act(() => result.current.handleChange(changeEvent('입력')));
      expect(onTextChange).toHaveBeenCalledWith('입력');
    });
  });

  describe('isLimitReached', () => {
    it('글자수 제한 이내면 false', () => {
      const { result } = setup({ initialText: 'a'.repeat(MAX_TOPIC_TEXT_SIZE) });
      expect(result.current.isLimitReached).toBe(false);
    });

    it('글자수 제한 초과 시 true', () => {
      const { result } = setup();
      act(() =>
        result.current.handleChange(
          changeEvent('a'.repeat(MAX_TOPIC_TEXT_SIZE + 1)),
        ),
      );
      expect(result.current.isLimitReached).toBe(true);
    });
  });

  describe('handleKeyDown', () => {
    it('Enter → onSaveAndNext', () => {
      const onSaveAndNext = vi.fn();
      const { result } = setup({ onSaveAndNext });
      act(() => result.current.handleKeyDown(keyEvent('Enter')));
      expect(onSaveAndNext).toHaveBeenCalledOnce();
    });

    it('Tab → onSaveAndNext', () => {
      const onSaveAndNext = vi.fn();
      const { result } = setup({ onSaveAndNext });
      act(() => result.current.handleKeyDown(keyEvent('Tab')));
      expect(onSaveAndNext).toHaveBeenCalledOnce();
    });

    it('Shift+Tab → onSaveAndPrev', () => {
      const onSaveAndPrev = vi.fn();
      const { result } = setup({ onSaveAndPrev });
      act(() =>
        result.current.handleKeyDown(keyEvent('Tab', { shiftKey: true })),
      );
      expect(onSaveAndPrev).toHaveBeenCalledOnce();
    });

    it('ArrowUp → onSaveAndUp', () => {
      const onSaveAndUp = vi.fn();
      const { result } = setup({ onSaveAndUp });
      act(() => result.current.handleKeyDown(keyEvent('ArrowUp')));
      expect(onSaveAndUp).toHaveBeenCalledOnce();
    });

    it('ArrowDown → onSaveAndDown', () => {
      const onSaveAndDown = vi.fn();
      const { result } = setup({ onSaveAndDown });
      act(() => result.current.handleKeyDown(keyEvent('ArrowDown')));
      expect(onSaveAndDown).toHaveBeenCalledOnce();
    });

    it('Escape → onSaveAndClose', () => {
      const onSaveAndClose = vi.fn();
      const { result } = setup({ onSaveAndClose });
      act(() => result.current.handleKeyDown(keyEvent('Escape')));
      expect(onSaveAndClose).toHaveBeenCalledOnce();
    });

    it('다른 키는 콜백을 호출하지 않는다', () => {
      const callbacks = {
        onSaveAndNext: vi.fn(),
        onSaveAndPrev: vi.fn(),
        onSaveAndUp: vi.fn(),
        onSaveAndDown: vi.fn(),
        onSaveAndClose: vi.fn(),
      };
      const { result } = setup(callbacks);
      act(() => result.current.handleKeyDown(keyEvent('a')));

      Object.values(callbacks).forEach((fn) => {
        expect(fn).not.toHaveBeenCalled();
      });
    });
  });

  describe('cellKey 변경', () => {
    it('cellKey 변경 시 텍스트가 새 initialText로 초기화된다', () => {
      const { result, rerender, props } = setup({ initialText: '셀 A' });

      act(() => result.current.handleChange(changeEvent('편집 중')));
      expect(result.current.text).toBe('편집 중');

      rerender({ ...props, cellKey: 'cell-0-1', initialText: '셀 B' });
      expect(result.current.text).toBe('셀 B');
    });

    it('같은 cellKey에서 initialText만 바뀌면 편집 중인 텍스트를 보존한다', () => {
      const { result, rerender, props } = setup({ initialText: '원래 값' });

      act(() => result.current.handleChange(changeEvent('편집 중')));

      // cellKey 동일, initialText만 변경 — 외부 동기화 시뮬레이션
      rerender({ ...props, initialText: '외부에서 바뀜' });
      expect(result.current.text).toBe('편집 중');
    });
  });
});
