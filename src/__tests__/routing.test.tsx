import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEY_HAS_USED_TOOL } from '@/constants';

const markToolUsed = () => {
  if (!localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)) {
    localStorage.setItem(STORAGE_KEY_HAS_USED_TOOL, 'true');
  }
};

describe('has_used_tool flag', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should not exist for first-time visitors', () => {
    expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBeNull();
  });

  it('should be set after markToolUsed is called', () => {
    markToolUsed();
    expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
  });

  it('should not overwrite existing flag', () => {
    localStorage.setItem(STORAGE_KEY_HAS_USED_TOOL, 'true');
    markToolUsed();
    expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
  });
});
