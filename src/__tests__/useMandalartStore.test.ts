import { describe, it, expect, beforeEach } from 'vitest';
import { useMandalartStore } from '@/stores/useMandalartStore';
import {
  STORAGE_KEY_HAS_USED_TOOL,
  STORAGE_KEY_LAST_SELECTED_MANDALART_ID,
  createEmptyMeta,
  createEmptyTopicTree,
} from '@/constants';
import {
  loadGuestMandalartMetas,
  loadGuestTopicTrees,
} from '@/lib/guestStorage';
import { MandalartMeta, TopicNode } from '@/types';

// -- helpers --

const sampleMeta = (title = '목표'): MandalartMeta => ({ title });

const sampleTree = (rootText = '핵심'): TopicNode => ({
  text: rootText,
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
});

/** Guest 모드 스토어를 초기 상태로 리셋 */
const resetStore = () => {
  useMandalartStore.setState({
    metaMap: new Map(),
    currentMandalartId: null,
    currentTopicTree: null,
    isLoading: false,
    error: null,
    _user: null,
    _guestTopicTrees: new Map(),
  });
};

/** 스토어에 Guest 만다라트 1건을 미리 세팅 */
const seedGuest = (id: string, meta: MandalartMeta, tree: TopicNode) => {
  useMandalartStore.setState({
    metaMap: new Map([[id, meta]]),
    currentMandalartId: id,
    currentTopicTree: tree,
    _guestTopicTrees: new Map([[id, tree]]),
  });
};

// -- tests --

describe('useMandalartStore — Guest 모드', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  describe('selectMandalart', () => {
    it('id 선택 시 _guestTopicTrees에서 topicTree를 조회한다', () => {
      const tree = sampleTree();
      useMandalartStore.setState({
        _guestTopicTrees: new Map([['id1', tree]]),
      });

      useMandalartStore.getState().selectMandalart('id1');

      const state = useMandalartStore.getState();
      expect(state.currentMandalartId).toBe('id1');
      expect(state.currentTopicTree).toEqual(tree);
    });

    it('id 선택 시 localStorage에 마지막 선택 ID를 저장한다', () => {
      useMandalartStore.getState().selectMandalart('id1');

      expect(
        localStorage.getItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID),
      ).toBe('id1');
    });

    it('null 선택 시 currentTopicTree가 null이 된다', () => {
      seedGuest('id1', sampleMeta(), sampleTree());

      useMandalartStore.getState().selectMandalart(null);

      const state = useMandalartStore.getState();
      expect(state.currentMandalartId).toBeNull();
      expect(state.currentTopicTree).toBeNull();
    });

    it('null 선택 시 localStorage에서 마지막 선택 ID를 제거한다', () => {
      localStorage.setItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID, 'id1');

      useMandalartStore.getState().selectMandalart(null);

      expect(
        localStorage.getItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID),
      ).toBeNull();
    });
  });

  describe('_setMandalartMetas', () => {
    it('현재 선택된 ID가 metaMap에 있으면 선택을 유지한다', () => {
      const meta = sampleMeta();
      useMandalartStore.setState({ currentMandalartId: 'id1' });

      useMandalartStore.getState()._setMandalartMetas(new Map([['id1', meta]]));

      expect(useMandalartStore.getState().currentMandalartId).toBe('id1');
    });

    it('현재 선택된 ID가 metaMap에 없으면 localStorage 저장 ID로 복원한다', () => {
      localStorage.setItem(STORAGE_KEY_LAST_SELECTED_MANDALART_ID, 'saved');
      const tree = sampleTree();
      useMandalartStore.setState({
        currentMandalartId: 'deleted',
        _guestTopicTrees: new Map([['saved', tree]]),
      });

      useMandalartStore
        .getState()
        ._setMandalartMetas(new Map([['saved', sampleMeta()]]));

      expect(useMandalartStore.getState().currentMandalartId).toBe('saved');
    });

    it('localStorage 저장 ID도 없으면 마지막 항목으로 fallback한다', () => {
      const tree = sampleTree();
      useMandalartStore.setState({
        currentMandalartId: 'deleted',
        _guestTopicTrees: new Map([
          ['a', tree],
          ['b', tree],
        ]),
      });

      useMandalartStore.getState()._setMandalartMetas(
        new Map([
          ['a', sampleMeta('A')],
          ['b', sampleMeta('B')],
        ]),
      );

      // Map의 마지막 항목 = 'b'
      expect(useMandalartStore.getState().currentMandalartId).toBe('b');
    });

    it('빈 metaMap + null 선택 상태에서 선택을 변경하지 않는다', () => {
      useMandalartStore.setState({ currentMandalartId: null });

      useMandalartStore.getState()._setMandalartMetas(new Map());

      expect(useMandalartStore.getState().currentMandalartId).toBeNull();
    });
  });

  describe('saveMandalartMeta', () => {
    it('metaMap을 갱신하고 localStorage에 저장한다', async () => {
      seedGuest('id1', sampleMeta('이전'), sampleTree());

      const newMeta = sampleMeta('이후');
      await useMandalartStore.getState().saveMandalartMeta('id1', newMeta);

      // 스토어 갱신 확인
      expect(useMandalartStore.getState().metaMap.get('id1')).toEqual(newMeta);
      // localStorage 영속화 확인
      const persisted = loadGuestMandalartMetas();
      expect(persisted.get('id1')).toEqual(newMeta);
    });

    it('has_used_tool 플래그를 설정한다', async () => {
      seedGuest('id1', sampleMeta(), sampleTree());

      await useMandalartStore.getState().saveMandalartMeta('id1', sampleMeta());

      expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
    });

    it('id가 null이면 아무 동작하지 않는다', async () => {
      const before = new Map(useMandalartStore.getState().metaMap);

      await useMandalartStore.getState().saveMandalartMeta(null, sampleMeta());

      expect(useMandalartStore.getState().metaMap).toEqual(before);
    });
  });

  describe('saveTopicTree', () => {
    it('_guestTopicTrees를 갱신하고 localStorage에 저장한다', async () => {
      seedGuest('id1', sampleMeta(), sampleTree('이전'));

      const newTree = sampleTree('이후');
      await useMandalartStore.getState().saveTopicTree('id1', newTree);

      expect(useMandalartStore.getState()._guestTopicTrees.get('id1')).toEqual(
        newTree,
      );
      const persisted = loadGuestTopicTrees();
      expect(persisted.get('id1')).toEqual(newTree);
    });

    it('현재 선택된 만다라트면 currentTopicTree도 갱신한다', async () => {
      seedGuest('id1', sampleMeta(), sampleTree('이전'));

      const newTree = sampleTree('이후');
      await useMandalartStore.getState().saveTopicTree('id1', newTree);

      expect(useMandalartStore.getState().currentTopicTree).toEqual(newTree);
    });

    it('다른 만다라트면 currentTopicTree를 변경하지 않는다', async () => {
      const currentTree = sampleTree('현재');
      seedGuest('current', sampleMeta(), currentTree);
      // 다른 ID의 topicTree도 등록
      useMandalartStore.setState({
        _guestTopicTrees: new Map([
          ['current', currentTree],
          ['other', sampleTree('다른')],
        ]),
      });

      await useMandalartStore
        .getState()
        .saveTopicTree('other', sampleTree('변경'));

      // 현재 선택은 영향받지 않음
      expect(useMandalartStore.getState().currentTopicTree).toEqual(
        currentTree,
      );
    });

    it('has_used_tool 플래그를 설정한다', async () => {
      seedGuest('id1', sampleMeta(), sampleTree());

      await useMandalartStore.getState().saveTopicTree('id1', sampleTree());

      expect(localStorage.getItem(STORAGE_KEY_HAS_USED_TOOL)).toBe('true');
    });
  });

  describe('resetMandalart', () => {
    it('meta와 topicTree를 빈 값으로 초기화한다', async () => {
      seedGuest('id1', sampleMeta('수정됨'), sampleTree('수정됨'));

      await useMandalartStore.getState().resetMandalart('id1');

      const state = useMandalartStore.getState();
      expect(state.metaMap.get('id1')).toEqual(createEmptyMeta());
      expect(state._guestTopicTrees.get('id1')).toEqual(
        createEmptyTopicTree(),
      );
      // localStorage에도 반영
      expect(loadGuestMandalartMetas().get('id1')).toEqual(createEmptyMeta());
      expect(loadGuestTopicTrees().get('id1')).toEqual(createEmptyTopicTree());
    });

    it('현재 선택된 만다라트면 currentTopicTree도 빈 트리가 된다', async () => {
      seedGuest('id1', sampleMeta('수정됨'), sampleTree('수정됨'));

      await useMandalartStore.getState().resetMandalart('id1');

      expect(useMandalartStore.getState().currentTopicTree).toEqual(
        createEmptyTopicTree(),
      );
    });

    it('id가 null이면 아무 동작하지 않는다', async () => {
      seedGuest('id1', sampleMeta('유지'), sampleTree('유지'));

      await useMandalartStore.getState().resetMandalart(null);

      expect(useMandalartStore.getState().metaMap.get('id1')?.title).toBe(
        '유지',
      );
    });
  });

  describe('createMandalart', () => {
    it('Guest 모드에서 signInRequired 에러를 throw한다', async () => {
      await expect(
        useMandalartStore.getState().createMandalart(sampleMeta(), sampleTree()),
      ).rejects.toThrow();
    });
  });

  describe('deleteMandalart', () => {
    it('Guest 모드에서 false를 반환한다', async () => {
      const result = await useMandalartStore
        .getState()
        .deleteMandalart('id1');
      expect(result).toBe(false);
    });
  });
});
