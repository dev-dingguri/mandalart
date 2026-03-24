import { vi, describe, it, expect, beforeEach } from 'vitest';

// -- Firebase module mocks --
// User 모드 테스트에서 실제 Firebase 호출을 차단하기 위해 모듈 레벨에서 mock

const mockPush = vi.fn();
const mockRef = vi.fn();
const mockFbSet = vi.fn().mockResolvedValue(undefined);
const mockFbUpdate = vi.fn().mockResolvedValue(undefined);

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
  push: (...args: unknown[]) => mockPush(...args),
  set: (...args: unknown[]) => mockFbSet(...args),
  update: (...args: unknown[]) => mockFbUpdate(...args),
  onValue: vi.fn(),
}));

import { useMandalartStore } from '@/stores/useMandalartStore';
import {
  STORAGE_KEY_HAS_USED_TOOL,
  STORAGE_KEY_LAST_SELECTED_MANDALART_ID,
  MAX_UPLOAD_MANDALARTS_SIZE,
  createEmptyMeta,
  createEmptyTopicTree,
  DB_SNIPPETS,
  DB_TOPIC_TREES,
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

const sampleMeta = (title = '목표'): MandalartMeta => ({ title });

const sampleTree = (rootText = '핵심'): TopicNode => ({
  text: rootText,
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
});

/** User 모드 스토어를 초기 상태로 리셋 */
const resetStore = () => {
  useMandalartStore.setState({
    metaMap: new Map(),
    currentMandalartId: null,
    currentTopicTree: null,
    isLoading: false,
    error: null,
    _user: mockUser,
    _guestTopicTrees: new Map(),
  });
};

// -- tests --

describe('useMandalartStore — User 모드', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetStore();
    // push()가 기본적으로 유효한 key를 반환하도록 설정
    mockPush.mockReturnValue({ key: 'new-id' });
    mockRef.mockReturnValue({});
  });

  describe('selectMandalart', () => {
    it('User 모드에서 currentTopicTree를 유지한다', () => {
      const tree = sampleTree();
      useMandalartStore.setState({ currentTopicTree: tree });

      useMandalartStore.getState().selectMandalart('other-id');

      const state = useMandalartStore.getState();
      expect(state.currentMandalartId).toBe('other-id');
      // User 모드에서는 onValue 구독이 도착할 때까지 이전 tree를 유지
      expect(state.currentTopicTree).toEqual(tree);
    });

    it('localStorage에 마지막 선택 ID를 저장한다', () => {
      useMandalartStore.getState().selectMandalart('some-id');

      expect(
        localStorage.getItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID),
      ).toBe('some-id');
    });
  });

  describe('createMandalart', () => {
    it('Firebase에 원자적으로 쓰기한다', async () => {
      const meta = sampleMeta('새 목표');
      const tree = sampleTree('새 핵심');

      await useMandalartStore.getState().createMandalart(meta, tree);

      // ref()가 push용과 update용으로 호출됨
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockFbUpdate).toHaveBeenCalledTimes(1);

      // update에 전달된 데이터에 snippets와 topictrees 경로가 포함되어야 함
      const updateData = mockFbUpdate.mock.calls[0][1];
      expect(updateData[`${DB_SNIPPETS}/new-id`]).toEqual(meta);
      expect(updateData[`${DB_TOPIC_TREES}/new-id`]).toEqual(tree);
    });

    it('currentMandalartId를 새 ID로 설정한다', async () => {
      await useMandalartStore
        .getState()
        .createMandalart(sampleMeta(), sampleTree());

      expect(useMandalartStore.getState().currentMandalartId).toBe('new-id');
    });

    it('push()가 key를 반환하지 않으면 에러를 throw한다', async () => {
      mockPush.mockReturnValue({ key: null });

      await expect(
        useMandalartStore.getState().createMandalart(sampleMeta(), sampleTree()),
      ).rejects.toThrow();
    });

    it('최대 개수 초과 시 에러를 throw한다', async () => {
      // metaMap을 MAX_UPLOAD_MANDALARTS_SIZE만큼 채움
      const fullMap = new Map<string, MandalartMeta>();
      for (let i = 0; i < MAX_UPLOAD_MANDALARTS_SIZE; i++) {
        fullMap.set(`id-${i}`, sampleMeta(`목표 ${i}`));
      }
      useMandalartStore.setState({ metaMap: fullMap });

      await expect(
        useMandalartStore.getState().createMandalart(sampleMeta(), sampleTree()),
      ).rejects.toThrow();

      // Firebase에 쓰기 시도하지 않아야 함
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deleteMandalart', () => {
    it('Firebase에서 snippets와 topictrees를 null로 설정한다', async () => {
      await useMandalartStore.getState().deleteMandalart('target-id');

      expect(mockFbUpdate).toHaveBeenCalledTimes(1);
      const updateData = mockFbUpdate.mock.calls[0][1];
      expect(updateData[`${DB_SNIPPETS}/target-id`]).toBeNull();
      expect(updateData[`${DB_TOPIC_TREES}/target-id`]).toBeNull();
    });

    it('성공 시 true를 반환한다', async () => {
      const result = await useMandalartStore
        .getState()
        .deleteMandalart('target-id');

      expect(result).toBe(true);
    });

    it('id가 null이면 false를 반환한다', async () => {
      const result = await useMandalartStore.getState().deleteMandalart(null);

      expect(result).toBe(false);
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });

    it('user가 없으면 false를 반환한다', async () => {
      useMandalartStore.setState({ _user: null });

      const result = await useMandalartStore
        .getState()
        .deleteMandalart('target-id');

      expect(result).toBe(false);
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });
  });

  describe('saveMandalartMeta', () => {
    it('Firebase에 meta를 저장한다', async () => {
      const meta = sampleMeta('수정된 목표');

      await useMandalartStore.getState().saveMandalartMeta('id1', meta);

      expect(mockFbSet).toHaveBeenCalledTimes(1);
      // ref 경로 인자 확인: db, `{uid}/snippets/{id}`
      expect(mockRef).toHaveBeenCalledWith(
        { __mockDb: true },
        `${mockUser.uid}/${DB_SNIPPETS}/id1`,
      );
      expect(mockFbSet).toHaveBeenCalledWith({}, meta);
    });

    it('has_used_tool 플래그를 설정한다', async () => {
      await useMandalartStore
        .getState()
        .saveMandalartMeta('id1', sampleMeta());

      expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
    });
  });

  describe('saveTopicTree', () => {
    it('Firebase에 topicTree를 저장한다', async () => {
      const tree = sampleTree('변경된 핵심');

      await useMandalartStore.getState().saveTopicTree('id1', tree);

      expect(mockFbSet).toHaveBeenCalledTimes(1);
      expect(mockRef).toHaveBeenCalledWith(
        { __mockDb: true },
        `${mockUser.uid}/${DB_TOPIC_TREES}/id1`,
      );
      expect(mockFbSet).toHaveBeenCalledWith({}, tree);
    });

    it('has_used_tool 플래그를 설정한다', async () => {
      await useMandalartStore
        .getState()
        .saveTopicTree('id1', sampleTree());

      expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
    });
  });

  describe('resetMandalart', () => {
    it('Firebase에 빈 meta와 topicTree를 원자적으로 쓰기한다', async () => {
      await useMandalartStore.getState().resetMandalart('id1');

      expect(mockFbUpdate).toHaveBeenCalledTimes(1);
      const updateData = mockFbUpdate.mock.calls[0][1];
      expect(updateData[`${DB_SNIPPETS}/id1`]).toEqual(createEmptyMeta());
      expect(updateData[`${DB_TOPIC_TREES}/id1`]).toEqual(
        createEmptyTopicTree(),
      );
    });

    it('id가 null이면 아무 동작하지 않는다', async () => {
      await useMandalartStore.getState().resetMandalart(null);

      expect(mockFbUpdate).not.toHaveBeenCalled();
    });
  });

  describe('uploadTemp', () => {
    it('게스트 데이터가 변경되었으면 createMandalart를 호출하고 게스트 데이터를 지운다', async () => {
      // 변경된 게스트 데이터를 localStorage에 세팅
      saveGuestMandalartMetas(
        new Map([['temp-id', sampleMeta('게스트 목표')]]),
      );
      saveGuestTopicTrees(
        new Map([['temp-id', sampleTree('게스트 핵심')]]),
      );

      await useMandalartStore.getState().uploadTemp();

      // createMandalart 내부에서 fbUpdate가 호출되어야 함
      expect(mockFbUpdate).toHaveBeenCalledTimes(1);
      const updateData = mockFbUpdate.mock.calls[0][1];
      expect(updateData[`${DB_SNIPPETS}/new-id`]).toEqual(
        sampleMeta('게스트 목표'),
      );
      expect(updateData[`${DB_TOPIC_TREES}/new-id`]).toEqual(
        sampleTree('게스트 핵심'),
      );

      // 게스트 localStorage가 비워져야 함 (빈 Map으로 저장)
      const remainingMetas = loadGuestMandalartMetas();
      const remainingTrees = loadGuestTopicTrees();
      expect(remainingMetas.size).toBe(0);
      expect(remainingTrees.size).toBe(0);
    });

    it('게스트 데이터가 빈 상태면 아무 동작하지 않는다', async () => {
      // localStorage에 게스트 데이터 없음 (clear 상태)

      await useMandalartStore.getState().uploadTemp();

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });

    it('게스트 데이터가 초기값(변경 없음)이면 스킵한다', async () => {
      // isAnyChanged가 false를 반환하는 경우: 빈 meta + 빈 topicTree
      saveGuestMandalartMetas(
        new Map([['temp-id', createEmptyMeta()]]),
      );
      saveGuestTopicTrees(
        new Map([['temp-id', createEmptyTopicTree()]]),
      );

      await useMandalartStore.getState().uploadTemp();

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });

    it('최대 개수 초과 시 에러를 throw한다', async () => {
      // metaMap을 MAX_UPLOAD_MANDALARTS_SIZE만큼 채움
      const fullMap = new Map<string, MandalartMeta>();
      for (let i = 0; i < MAX_UPLOAD_MANDALARTS_SIZE; i++) {
        fullMap.set(`id-${i}`, sampleMeta(`목표 ${i}`));
      }
      useMandalartStore.setState({ metaMap: fullMap });

      // 변경된 게스트 데이터 세팅
      saveGuestMandalartMetas(
        new Map([['temp-id', sampleMeta('게스트 목표')]]),
      );
      saveGuestTopicTrees(
        new Map([['temp-id', sampleTree('게스트 핵심')]]),
      );

      await expect(
        useMandalartStore.getState().uploadTemp(),
      ).rejects.toThrow();

      expect(mockFbUpdate).not.toHaveBeenCalled();
    });

    it('user가 없으면 아무 동작하지 않는다', async () => {
      useMandalartStore.setState({ _user: null });

      saveGuestMandalartMetas(
        new Map([['temp-id', sampleMeta('게스트 목표')]]),
      );
      saveGuestTopicTrees(
        new Map([['temp-id', sampleTree('게스트 핵심')]]),
      );

      await useMandalartStore.getState().uploadTemp();

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockFbUpdate).not.toHaveBeenCalled();
    });
  });
});

