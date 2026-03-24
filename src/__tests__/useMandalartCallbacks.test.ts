import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { useMandalartCallbacks } from '@/hooks/useMandalartCallbacks';
import type { TFunction } from 'i18next';
import type { MandalartMeta, TopicNode } from '@/types';

// -- module mocks --

vi.mock('@/lib/firebase', () => ({
  auth: { onAuthStateChanged: vi.fn() },
  db: {},
  analytics: null,
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  onValue: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ onAuthStateChanged: vi.fn() })),
  GoogleAuthProvider: { PROVIDER_ID: 'google.com' },
  signInWithPopup: vi.fn(),
}));

vi.mock('@/lib/analyticsEvents', () => ({
  trackMandalartCreate: vi.fn(),
  trackMandalartDelete: vi.fn(),
  trackMandalartReset: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}));

import {
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
} from '@/lib/analyticsEvents';
import { toast } from 'sonner';

// -- helpers --

const sampleMeta = (title = '목표'): MandalartMeta => ({ title });

const sampleTree = (rootText = '핵심'): TopicNode => ({
  text: rootText,
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
});

// -- shared deps & setup --

const openAlert = vi.fn();
const openConfirmDialog = vi.fn();
const t = vi.fn((key: string) => key) as unknown as TFunction;

const mockSelectMandalart = vi.fn();
const mockCreateMandalart = vi.fn().mockResolvedValue(undefined);
const mockDeleteMandalart = vi.fn().mockResolvedValue(true);
const mockSaveMandalartMeta = vi.fn().mockResolvedValue(undefined);
const mockSaveTopicTree = vi.fn().mockResolvedValue(undefined);
const mockResetMandalart = vi.fn().mockResolvedValue(undefined);

const setupStores = () => {
  useMandalartStore.setState({
    currentMandalartId: 'test-id',
    metaMap: new Map(),
    currentTopicTree: null,
    _user: null,
    _guestTopicTrees: new Map(),
    isLoading: false,
    error: null,
    selectMandalart: mockSelectMandalart,
    createMandalart: mockCreateMandalart,
    deleteMandalart: mockDeleteMandalart,
    saveMandalartMeta: mockSaveMandalartMeta,
    saveTopicTree: mockSaveTopicTree,
    resetMandalart: mockResetMandalart,
  });
  useLoadingStore.setState({ conditions: new Map() });
};

const renderCallbacks = () =>
  renderHook(() =>
    useMandalartCallbacks({ openAlert, openConfirmDialog, t }),
  );

// -- tests --

describe('useMandalartCallbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupStores();
  });

  // -- onSelect --

  describe('onSelect', () => {
    it('selectMandalart를 호출한다', () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onSelect('id1');
      });

      expect(mockSelectMandalart).toHaveBeenCalledWith('id1');
    });
  });

  // -- onMetaChange --

  describe('onMetaChange', () => {
    it('현재 ID로 saveMandalartMeta를 호출한다', () => {
      const { result } = renderCallbacks();
      const meta = sampleMeta('새 제목');

      act(() => {
        result.current.onMetaChange(meta);
      });

      expect(mockSaveMandalartMeta).toHaveBeenCalledWith('test-id', meta);
    });

    it('저장 실패 시 toast.error를 표시한다', async () => {
      mockSaveMandalartMeta.mockReturnValue(
        Promise.reject(new Error('save failed')),
      );
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onMetaChange(sampleMeta());
      });

      expect(toast.error).toHaveBeenCalledWith(
        'mandalart.errors.save.default',
      );
    });
  });

  // -- onTopicTreeChange --

  describe('onTopicTreeChange', () => {
    it('현재 ID로 saveTopicTree를 호출한다', () => {
      const { result } = renderCallbacks();
      const tree = sampleTree();

      act(() => {
        result.current.onTopicTreeChange(tree);
      });

      expect(mockSaveTopicTree).toHaveBeenCalledWith('test-id', tree);
    });

    it('저장 실패 시 toast.error를 표시한다', async () => {
      mockSaveTopicTree.mockReturnValue(
        Promise.reject(new Error('save failed')),
      );
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onTopicTreeChange(sampleTree());
      });

      expect(toast.error).toHaveBeenCalledWith(
        'mandalart.errors.save.default',
      );
    });
  });

  // -- onCreate --

  describe('onCreate', () => {
    it('createMandalart를 호출하고 성공 시 analytics를 추적한다', async () => {
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onCreate();
      });

      expect(mockCreateMandalart).toHaveBeenCalled();
      expect(trackMandalartCreate).toHaveBeenCalled();
    });

    it('성공 시 afterSuccess 콜백을 호출한다', async () => {
      const afterSuccess = vi.fn();
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onCreate(afterSuccess);
      });

      expect(afterSuccess).toHaveBeenCalled();
    });

    it('실패 시 openAlert를 호출한다', async () => {
      mockCreateMandalart.mockRejectedValue(new Error('생성 실패'));
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onCreate();
      });

      expect(openAlert).toHaveBeenCalledWith('생성 실패');
    });

    it('로딩 중이면 중복 호출을 방지한다', async () => {
      // 수동으로 로딩 조건 설정
      useLoadingStore.getState().addCondition('mandalart:create', true);
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onCreate();
      });

      expect(mockCreateMandalart).not.toHaveBeenCalled();
    });

    it('완료 시 로딩 상태를 해제한다', async () => {
      const { result } = renderCallbacks();

      await act(async () => {
        result.current.onCreate();
      });

      const { conditions } = useLoadingStore.getState();
      expect(conditions.has('mandalart:create')).toBe(false);
    });
  });

  // -- onDelete --

  describe('onDelete', () => {
    it('openConfirmDialog를 호출한다', () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onDelete('id1');
      });

      expect(openConfirmDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'mandalart.confirmDelete',
          confirmText: 'mandalart.delete',
          onConfirm: expect.any(Function),
        }),
      );
    });

    it('확인 시 deleteMandalart를 호출하고 성공하면 analytics를 추적한다', async () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onDelete('id1');
      });

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(mockDeleteMandalart).toHaveBeenCalledWith('id1');
      expect(trackMandalartDelete).toHaveBeenCalled();
    });

    it('삭제되지 않으면 analytics를 추적하지 않는다', async () => {
      mockDeleteMandalart.mockResolvedValue(false);
      const { result } = renderCallbacks();

      act(() => {
        result.current.onDelete('id1');
      });

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(mockDeleteMandalart).toHaveBeenCalledWith('id1');
      expect(trackMandalartDelete).not.toHaveBeenCalled();
    });

    it('실패 시 openAlert를 호출한다', async () => {
      mockDeleteMandalart.mockRejectedValue(new Error('삭제 실패'));
      const { result } = renderCallbacks();

      act(() => {
        result.current.onDelete('id1');
      });

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(openAlert).toHaveBeenCalledWith('삭제 실패');
    });

    it('로딩 중이면 중복 호출을 방지한다', async () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onDelete('id1');
      });

      // 로딩 조건을 수동 설정 후 onConfirm 호출
      useLoadingStore.getState().addCondition('mandalart:delete', true);

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(mockDeleteMandalart).not.toHaveBeenCalled();
    });
  });

  // -- onReset --

  describe('onReset', () => {
    it('openConfirmDialog를 호출한다', () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onReset('id1');
      });

      expect(openConfirmDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'mandalart.confirmReset',
          confirmText: 'mandalart.reset',
          onConfirm: expect.any(Function),
        }),
      );
    });

    it('확인 시 resetMandalart를 호출하고 analytics를 추적한다', async () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onReset('id1');
      });

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(mockResetMandalart).toHaveBeenCalledWith('id1');
      expect(trackMandalartReset).toHaveBeenCalled();
    });

    it('실패 시 openAlert를 호출한다', async () => {
      mockResetMandalart.mockRejectedValue(new Error('초기화 실패'));
      const { result } = renderCallbacks();

      act(() => {
        result.current.onReset('id1');
      });

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(openAlert).toHaveBeenCalledWith('초기화 실패');
    });

    it('로딩 중이면 중복 호출을 방지한다', async () => {
      const { result } = renderCallbacks();

      act(() => {
        result.current.onReset('id1');
      });

      // 로딩 조건을 수동 설정 후 onConfirm 호출
      useLoadingStore.getState().addCondition('mandalart:reset', true);

      const { onConfirm } = openConfirmDialog.mock.calls[0][0];
      await act(async () => {
        onConfirm();
      });

      expect(mockResetMandalart).not.toHaveBeenCalled();
    });
  });
});
