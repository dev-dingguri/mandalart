import { describe, it, expect, beforeEach } from 'vitest';
import { useLoadingStore } from '@/stores/useLoadingStore';

describe('useLoadingStore', () => {
  beforeEach(() => {
    useLoadingStore.setState({ conditions: new Map(), isLoading: false });
  });

  it('초기 상태: isLoading이 false여야 한다', () => {
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it('addCondition(true) 후 isLoading이 true가 되어야 한다', () => {
    useLoadingStore.getState().addCondition('test', true);
    expect(useLoadingStore.getState().isLoading).toBe(true);
  });

  it('addCondition(false)만 있으면 isLoading이 false여야 한다', () => {
    useLoadingStore.getState().addCondition('test', false);
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it('deleteCondition 후 isLoading이 올바르게 재계산되어야 한다', () => {
    useLoadingStore.getState().addCondition('a', true);
    useLoadingStore.getState().addCondition('b', false);
    expect(useLoadingStore.getState().isLoading).toBe(true);
    useLoadingStore.getState().deleteCondition('a');
    expect(useLoadingStore.getState().isLoading).toBe(false);
  });

  it('여러 조건 중 하나라도 true면 isLoading이 true여야 한다', () => {
    useLoadingStore.getState().addCondition('a', false);
    useLoadingStore.getState().addCondition('b', true);
    useLoadingStore.getState().addCondition('c', false);
    expect(useLoadingStore.getState().isLoading).toBe(true);
  });
});
