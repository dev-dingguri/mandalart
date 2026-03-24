import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModal } from '@/hooks/useModal';

describe('useModal', () => {
  it('초기 상태: isOpen=false, content=null', () => {
    const { result } = renderHook(() => useModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.content).toBeNull();
  });

  it('open() 호출 시 isOpen이 true가 된다', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
  });

  it('open(content) 호출 시 content가 설정된다', () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => result.current.open('알림 메시지'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.content).toBe('알림 메시지');
  });

  it('open() content 없이 호출하면 content는 null이다', () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.content).toBeNull();
  });

  it('close() 호출 시 isOpen이 false가 된다', () => {
    const { result } = renderHook(() => useModal());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('close() 후에도 content는 유지된다 (애니메이션 대응)', () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => result.current.open('유지될 내용'));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    // 닫힐 때 애니메이션이 있는 경우를 위해 content를 제거하지 않음
    expect(result.current.content).toBe('유지될 내용');
  });

  it('open → close → open 시 새 content로 교체된다', () => {
    const { result } = renderHook(() => useModal<string>());
    act(() => result.current.open('첫 번째'));
    act(() => result.current.close());
    act(() => result.current.open('두 번째'));
    expect(result.current.content).toBe('두 번째');
  });

  it('제네릭 타입으로 객체 content를 사용할 수 있다', () => {
    type Options = { message: string; confirmText: string };
    const { result } = renderHook(() => useModal<Options>());
    const opts: Options = { message: '삭제?', confirmText: '확인' };
    act(() => result.current.open(opts));
    expect(result.current.content).toEqual(opts);
  });
});
