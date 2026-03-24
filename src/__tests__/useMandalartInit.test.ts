import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// -- Firebase module mocks --

const mockRef = vi.fn((_db: any, path?: string) => ({ __path: path }));
const mockOnValue = vi.fn();

vi.mock('@/lib/firebase', () => ({
  auth: { onAuthStateChanged: vi.fn() },
  db: { __mockDb: true },
  analytics: null,
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ onAuthStateChanged: vi.fn() })),
  GoogleAuthProvider: { PROVIDER_ID: 'google.com' },
  signInWithPopup: vi.fn(),
}));

vi.mock('firebase/database', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  push: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  onValue: (...args: unknown[]) => mockOnValue(...args),
}));

import {
  useMandalartInit,
  useMandalartStore,
} from '@/stores/useMandalartStore';
import {
  TMP_MANDALART_ID,
  createEmptyMeta,
  createEmptyTopicTree,
  DB_SNIPPETS,
  DB_TOPIC_TREES,
  STORAGE_KEY_LAST_SELECTED_MANDALART_ID,
} from '@/constants';
import {
  saveGuestMandalartMetas,
  saveGuestTopicTrees,
  loadGuestMandalartMetas,
  loadGuestTopicTrees,
} from '@/lib/guestStorage';
import { MandalartMeta, TopicNode } from '@/types';

// -- helpers --

const mockUser = { uid: 'test-uid' } as any;
const otherUser = { uid: 'other-uid' } as any;

const sampleMeta = (title = '목표'): MandalartMeta => ({ title });

const sampleTree = (rootText = '핵심'): TopicNode => ({
  text: rootText,
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
});

/** 스토어를 초기 상태로 완전 리셋 */
const resetStore = () => {
  useMandalartStore.setState({
    metaMap: new Map(),
    currentMandalartId: null,
    currentTopicTree: null,
    isLoading: true,
    error: null,
    _user: null,
    _guestTopicTrees: new Map(),
  });
};

/** Firebase DataSnapshot mock — meta 리스트용 (forEach 패턴) */
const createMetaSnapshot = (entries: [string, MandalartMeta][]) => ({
  forEach: (cb: (child: { key: string; val: () => MandalartMeta }) => void) => {
    entries.forEach(([key, val]) => cb({ key, val: () => val }));
  },
});

/** Firebase DataSnapshot mock — 단일 값(TopicNode)용 */
const createValueSnapshot = <T>(value: T) => ({
  val: () => value,
});

/**
 * mockOnValue의 N번째 호출에서 콜백을 추출.
 * onValue(ref, successCb, errorCb) 시그니처에 대응
 */
const getOnValueCall = (index: number) => {
  const call = mockOnValue.mock.calls[index];
  return {
    ref: call[0],
    onSuccess: call[1] as (snapshot: any) => void,
    onError: call[2] as (error: Error) => void,
  };
};

// -- tests --

describe('useMandalartInit', () => {
  let mockUnsubscribes: ReturnType<typeof vi.fn>[];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetStore();

    // onValue가 호출될 때마다 고유한 unsubscribe 함수를 반환
    mockUnsubscribes = [];
    mockOnValue.mockImplementation(() => {
      const unsub = vi.fn();
      mockUnsubscribes.push(unsub);
      return unsub;
    });
  });

  // ── Effect 1: _user sync ──────────────────────────────────

  describe('_user 동기화', () => {
    it('user prop을 스토어의 _user에 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      expect(useMandalartStore.getState()._user).toBe(mockUser);
    });

    it('user가 null이면 _user를 null로 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      expect(useMandalartStore.getState()._user).toBeNull();
    });

    it('user가 변경되면 _user를 업데이트한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useMandalartInit(user),
        { initialProps: { user: mockUser as any } },
      );

      rerender({ user: otherUser });

      expect(useMandalartStore.getState()._user).toBe(otherUser);
    });
  });

  // ── Effect 2: User mode — meta 구독 ──────────────────────

  describe('User 모드 — meta 구독', () => {
    it('snippets 경로에 onValue 구독을 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      expect(mockRef).toHaveBeenCalledWith(
        { __mockDb: true },
        `${mockUser.uid}/${DB_SNIPPETS}`,
      );
      expect(mockOnValue).toHaveBeenCalled();
    });

    it('구독 시작 시 스토어를 로딩 상태로 리셋한다', () => {
      // 이전 데이터가 남아있는 상태에서 시작
      useMandalartStore.setState({
        metaMap: new Map([['old', sampleMeta()]]),
        currentMandalartId: 'old',
        currentTopicTree: sampleTree(),
        isLoading: false,
        error: new Error('이전 에러'),
      });

      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      const s = useMandalartStore.getState();
      expect(s.isLoading).toBe(true);
      expect(s.metaMap.size).toBe(0);
      expect(s.currentMandalartId).toBeNull();
      expect(s.currentTopicTree).toBeNull();
      expect(s.error).toBeNull();
    });

    it('snapshot 수신 시 metaMap을 업데이트한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([
            ['id1', sampleMeta('목표 1')],
            ['id2', sampleMeta('목표 2')],
          ]),
        );
      });

      const s = useMandalartStore.getState();
      expect(s.metaMap.size).toBe(2);
      expect(s.metaMap.get('id1')).toEqual(sampleMeta('목표 1'));
      expect(s.metaMap.get('id2')).toEqual(sampleMeta('목표 2'));
    });

    it('snapshot 수신 시 currentMandalartId를 자동 선택한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([['id1', sampleMeta()]]),
        );
      });

      expect(useMandalartStore.getState().currentMandalartId).toBe('id1');
    });

    it('빈 snapshot 수신 시 isLoading을 false로 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(createMetaSnapshot([]));
      });

      const s = useMandalartStore.getState();
      expect(s.metaMap.size).toBe(0);
      expect(s.isLoading).toBe(false);
    });

    it('에러 발생 시 error를 설정하고 isLoading을 false로 변경한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      const error = new Error('Firebase 에러');
      act(() => {
        getOnValueCall(0).onError(error);
      });

      const s = useMandalartStore.getState();
      expect(s.error).toBe(error);
      expect(s.isLoading).toBe(false);
    });

    it('user가 null로 변경되면 구독을 해제한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useMandalartInit(user),
        { initialProps: { user: mockUser as any } },
      );

      expect(mockUnsubscribes[0]).not.toHaveBeenCalled();

      rerender({ user: null });

      expect(mockUnsubscribes[0]).toHaveBeenCalledTimes(1);
    });

    it('user가 변경되면 기존 구독을 해제하고 새 구독을 설정한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useMandalartInit(user),
        { initialProps: { user: mockUser as any } },
      );

      const firstUnsub = mockUnsubscribes[0];
      const callsBefore = mockOnValue.mock.calls.length;

      rerender({ user: otherUser });

      expect(firstUnsub).toHaveBeenCalledTimes(1);
      // 새 user로 구독 재설정
      expect(mockOnValue.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  // ── Effect 3: User mode — topicTree 구독 ─────────────────

  describe('User 모드 — topicTree 구독', () => {
    it('currentMandalartId가 설정되면 topicTree 경로에 구독을 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      // meta snapshot → currentMandalartId 자동 선택 → topicTree 구독 시작
      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([['id1', sampleMeta()]]),
        );
      });

      const topicTreeRef = mockRef.mock.calls.find(
        (c) => typeof c[1] === 'string' && c[1].includes(DB_TOPIC_TREES),
      );
      expect(topicTreeRef).toBeDefined();
      expect(topicTreeRef![1]).toBe(
        `${mockUser.uid}/${DB_TOPIC_TREES}/id1`,
      );
    });

    it('topicTree snapshot 수신 시 currentTopicTree와 isLoading을 업데이트한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([['id1', sampleMeta()]]),
        );
      });

      const tree = sampleTree('테스트');
      const topicSubIdx = mockOnValue.mock.calls.length - 1;
      act(() => {
        getOnValueCall(topicSubIdx).onSuccess(createValueSnapshot(tree));
      });

      const s = useMandalartStore.getState();
      expect(s.currentTopicTree).toEqual(tree);
      expect(s.isLoading).toBe(false);
    });

    it('currentMandalartId가 null이면 currentTopicTree를 null로 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      // 빈 snapshot → currentMandalartId null 유지
      act(() => {
        getOnValueCall(0).onSuccess(createMetaSnapshot([]));
      });

      expect(useMandalartStore.getState().currentTopicTree).toBeNull();
    });

    it('stale 콜백을 무시한다 — ID가 이미 변경된 경우', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      // meta snapshot → id2 선택 (마지막 항목)
      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([
            ['id1', sampleMeta('1')],
            ['id2', sampleMeta('2')],
          ]),
        );
      });

      // id2의 topicTree 구독 콜백을 캡처
      const id2SubIdx = mockOnValue.mock.calls.length - 1;
      const staleCallback = getOnValueCall(id2SubIdx).onSuccess;

      // id1으로 전환 → 새 topicTree 구독 설정
      act(() => {
        useMandalartStore.getState().selectMandalart('id1');
      });

      // id1의 topicTree를 정상 수신
      const id1SubIdx = mockOnValue.mock.calls.length - 1;
      const id1Tree = sampleTree('id1-tree');
      act(() => {
        getOnValueCall(id1SubIdx).onSuccess(createValueSnapshot(id1Tree));
      });

      // stale id2 콜백 실행 — guard에 의해 무시되어야 함
      const staleTree = sampleTree('stale-data');
      act(() => {
        staleCallback(createValueSnapshot(staleTree));
      });

      // id1의 tree가 유지되어야 함
      expect(useMandalartStore.getState().currentTopicTree).toEqual(id1Tree);
    });

    it('topicTree 구독 에러 시 error를 설정한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([['id1', sampleMeta()]]),
        );
      });

      const topicSubIdx = mockOnValue.mock.calls.length - 1;
      const error = new Error('topicTree 에러');
      act(() => {
        getOnValueCall(topicSubIdx).onError(error);
      });

      const s = useMandalartStore.getState();
      expect(s.error).toBe(error);
      expect(s.isLoading).toBe(false);
    });

    it('currentMandalartId 변경 시 기존 topicTree 구독을 해제한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: mockUser },
      });

      act(() => {
        getOnValueCall(0).onSuccess(
          createMetaSnapshot([
            ['id1', sampleMeta()],
            ['id2', sampleMeta()],
          ]),
        );
      });

      // meta 구독 unsub은 [0], topicTree(id2) 구독 unsub은 [1]
      const topicUnsub = mockUnsubscribes[1];

      act(() => {
        useMandalartStore.getState().selectMandalart('id1');
      });

      expect(topicUnsub).toHaveBeenCalledTimes(1);
    });
  });

  // ── Effect 4: Guest mode — localStorage 초기화 ───────────

  describe('Guest 모드 — localStorage 초기화', () => {
    it('localStorage가 비어있으면 기본 만다라트를 생성한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      const s = useMandalartStore.getState();
      expect(s.metaMap.size).toBe(1);
      expect(s.metaMap.has(TMP_MANDALART_ID)).toBe(true);
      expect(s.metaMap.get(TMP_MANDALART_ID)).toEqual(createEmptyMeta());
      expect(s._guestTopicTrees.has(TMP_MANDALART_ID)).toBe(true);
      expect(s.currentMandalartId).toBe(TMP_MANDALART_ID);
      expect(s.isLoading).toBe(false);
    });

    it('기본 만다라트를 localStorage에 저장한다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      const metas = loadGuestMandalartMetas();
      const trees = loadGuestTopicTrees();
      expect(metas.has(TMP_MANDALART_ID)).toBe(true);
      expect(trees.has(TMP_MANDALART_ID)).toBe(true);
    });

    it('기존 데이터를 localStorage에서 로드한다', () => {
      const meta = sampleMeta('저장된 목표');
      const tree = sampleTree('저장된 핵심');
      saveGuestMandalartMetas(new Map([['saved-id', meta]]));
      saveGuestTopicTrees(new Map([['saved-id', tree]]));

      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      const s = useMandalartStore.getState();
      expect(s.metaMap.get('saved-id')).toEqual(meta);
      expect(s._guestTopicTrees.get('saved-id')).toEqual(tree);
      expect(s.currentMandalartId).toBe('saved-id');
      expect(s.currentTopicTree).toEqual(tree);
      expect(s.isLoading).toBe(false);
    });

    it('meta에 대응하는 topicTree가 없으면 빈 트리로 복구한다', () => {
      saveGuestMandalartMetas(new Map([['id1', sampleMeta()]]));
      saveGuestTopicTrees(new Map()); // id1의 tree가 없는 손상 상태

      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      const s = useMandalartStore.getState();
      expect(s._guestTopicTrees.get('id1')).toEqual(createEmptyTopicTree());

      // localStorage에도 복구 저장 확인
      const trees = loadGuestTopicTrees();
      expect(trees.get('id1')).toEqual(createEmptyTopicTree());
    });

    it('Firebase onValue 구독을 설정하지 않는다', () => {
      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      expect(mockOnValue).not.toHaveBeenCalled();
    });

    it('localStorage savedId로 선택을 복원한다', () => {
      const tree1 = sampleTree('1');
      const tree2 = sampleTree('2');
      saveGuestMandalartMetas(
        new Map([
          ['id1', sampleMeta('1')],
          ['id2', sampleMeta('2')],
        ]),
      );
      saveGuestTopicTrees(
        new Map([
          ['id1', tree1],
          ['id2', tree2],
        ]),
      );
      // savedId를 id1으로 설정 — 마지막 항목(id2)이 아닌 id1을 선택해야 함
      localStorage.setItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID, 'id1');

      renderHook(({ user }) => useMandalartInit(user), {
        initialProps: { user: null },
      });

      expect(useMandalartStore.getState().currentMandalartId).toBe('id1');
      expect(useMandalartStore.getState().currentTopicTree).toEqual(tree1);
    });
  });

  // ── Mode transitions ─────────────────────────────────────

  describe('모드 전환', () => {
    it('Guest → User: Firebase 구독을 시작한다', () => {
      const { rerender } = renderHook(
        ({ user }) => useMandalartInit(user),
        { initialProps: { user: null as any } },
      );

      expect(mockOnValue).not.toHaveBeenCalled();

      rerender({ user: mockUser });

      expect(mockOnValue).toHaveBeenCalled();
      expect(mockRef).toHaveBeenCalledWith(
        { __mockDb: true },
        `${mockUser.uid}/${DB_SNIPPETS}`,
      );
    });

    it('User → Guest: Firebase 구독을 해제하고 localStorage에서 초기화한다', () => {
      // 게스트 데이터를 미리 localStorage에 설정
      saveGuestMandalartMetas(
        new Map([['guest-id', sampleMeta('게스트')]]),
      );
      saveGuestTopicTrees(
        new Map([['guest-id', sampleTree('게스트')]]),
      );

      const { rerender } = renderHook(
        ({ user }) => useMandalartInit(user),
        { initialProps: { user: mockUser as any } },
      );

      rerender({ user: null });

      // Firebase 구독 해제 확인
      expect(mockUnsubscribes[0]).toHaveBeenCalled();

      // Guest 모드 데이터 로드 확인
      const s = useMandalartStore.getState();
      expect(s.metaMap.get('guest-id')).toEqual(sampleMeta('게스트'));
      expect(s.isLoading).toBe(false);
    });
  });
});
