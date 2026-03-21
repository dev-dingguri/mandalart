import { create } from 'zustand';
import {
  ref,
  push,
  set as fbSet,
  update as fbUpdate,
  onValue,
} from 'firebase/database';
import { User } from 'firebase/auth';
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import i18next from 'i18next';
import { MandalartMeta, TopicNode } from '@/types';
import {
  DB_SNIPPETS,
  DB_TOPIC_TREES,
  STORAGE_KEY_SNIPPETS,
  STORAGE_KEY_TOPIC_TREES,
  TMP_MANDALART_ID,
  createEmptyMeta,
  createEmptyTopicTree,
  MAX_UPLOAD_MANDALARTS_SIZE,
} from '@/constants';

// -- localStorage helpers --

// TODO: guest localStorage 데이터에 스키마 버전이 없음 (client-localstorage-schema).
// MandalartMeta/TopicNode 타입이 변경되면 기존 데이터와 호환되지 않을 수 있으므로
// 저장 형식에 version 필드를 추가하는 것을 고려.
const loadGuestMandalartMetas = (): Map<string, MandalartMeta> => {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY_SNIPPETS) || '{}'
    );
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
};

const saveGuestMandalartMetas = (map: Map<string, MandalartMeta>) => {
  localStorage.setItem(
    STORAGE_KEY_SNIPPETS,
    JSON.stringify(Object.fromEntries(map))
  );
};

const loadGuestTopicTrees = (): Map<string, TopicNode> => {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY_TOPIC_TREES) || '{}'
    );
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
};

const saveGuestTopicTrees = (map: Map<string, TopicNode>) => {
  localStorage.setItem(
    STORAGE_KEY_TOPIC_TREES,
    JSON.stringify(Object.fromEntries(map))
  );
};

const EMPTY_META_JSON = JSON.stringify(createEmptyMeta());
const EMPTY_TOPIC_TREE_JSON = JSON.stringify(createEmptyTopicTree());

const isAnyChanged = (meta: MandalartMeta, topicTree: TopicNode) =>
  JSON.stringify(meta) !== EMPTY_META_JSON ||
  JSON.stringify(topicTree) !== EMPTY_TOPIC_TREE_JSON;

// -- Store --

type MandalartState = {
  metaMap: Map<string, MandalartMeta>;
  currentMandalartId: string | null;
  currentTopicTree: TopicNode | null;
  isLoading: boolean;
  error: Error | null;

  selectMandalart: (id: string | null) => void;
  createMandalart: (meta: MandalartMeta, topicTree: TopicNode) => Promise<void>;
  deleteMandalart: (id: string | null) => Promise<boolean>;
  saveMandalartMeta: (id: string | null, meta: MandalartMeta) => Promise<void>;
  saveTopicTree: (id: string | null, topicTree: TopicNode) => Promise<void>;
  resetMandalart: (id: string | null) => Promise<void>;
  uploadTemp: () => Promise<void>;

  // Internal
  _user: User | null;
  _guestTopicTrees: Map<string, TopicNode>;
  _setMandalartMetas: (map: Map<string, MandalartMeta>) => void;
};

export const useMandalartStore = create<MandalartState>((set, get) => ({
  metaMap: new Map(),
  currentMandalartId: null,
  currentTopicTree: null,
  isLoading: true,
  error: null,
  _user: null,
  _guestTopicTrees: new Map(),

  selectMandalart: (id) => {
    const user = get()._user;
    if (user) {
      // User mode: currentTopicTree를 null로 비우지 않음 —
      // 새 구독의 onValue가 도착할 때까지 이전 tree를 유지하여
      // 만다라트 전환 시 순간적 빈 화면 방지
      set({ currentMandalartId: id });
    } else {
      // Guest mode: look up from local map
      const topicTree = id ? get()._guestTopicTrees.get(id) ?? null : null;
      set({ currentMandalartId: id, currentTopicTree: topicTree });
    }
  },

  _setMandalartMetas: (metaMap) => {
    const { currentMandalartId, selectMandalart } = get();
    const isSelected =
      (metaMap.size === 0 && currentMandalartId === null) ||
      (currentMandalartId !== null && metaMap.has(currentMandalartId));

    set({ metaMap });
    if (!isSelected) {
      const lastId = Array.from(metaMap.keys()).pop() ?? null;
      selectMandalart(lastId);
    }
  },

  createMandalart: async (meta, topicTree) => {
    const user = get()._user;
    if (!user) {
      throw new Error(`${i18next.t('mandalart.errors.create.signInRequired')}`);
    }

    const { metaMap } = get();
    if (metaMap.size + 1 > MAX_UPLOAD_MANDALARTS_SIZE) {
      throw new Error(
        `${i18next.t('mandalart.errors.create.maxUploaded', {
          maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
        })}`
      );
    }

    // push()에 값을 전달하지 않으면 키만 생성하고 실제 쓰기는 하지 않음
    const newRef = push(ref(db, `${user.uid}/${DB_SNIPPETS}`));
    const mandalartId = newRef.key;
    if (!mandalartId) {
      throw new Error(`${i18next.t('mandalart.errors.create.default')}`);
    }

    // snippets과 topictrees를 원자적으로 쓰기 —
    // onValue(snippets) 트리거 시점에 topicTree가 이미 존재하도록 보장
    await fbUpdate(ref(db, user.uid), {
      [`${DB_SNIPPETS}/${mandalartId}`]: meta,
      [`${DB_TOPIC_TREES}/${mandalartId}`]: topicTree,
    });
    set({ currentMandalartId: mandalartId });
  },

  deleteMandalart: async (id) => {
    const user = get()._user;
    if (!user || !id) return false;

    await fbUpdate(ref(db, user.uid), {
      [`${DB_SNIPPETS}/${id}`]: null,
      [`${DB_TOPIC_TREES}/${id}`]: null,
    });
    return true;
  },

  saveMandalartMeta: async (id, meta) => {
    if (!id) return;
    const user = get()._user;
    if (user) {
      await fbSet(ref(db, `${user.uid}/${DB_SNIPPETS}/${id}`), meta);
    } else {
      const metaMap = new Map(get().metaMap).set(id, meta);
      saveGuestMandalartMetas(metaMap);
      set({ metaMap });
    }
  },

  saveTopicTree: async (id, topicTree) => {
    if (!id) return;
    const user = get()._user;
    if (user) {
      await fbSet(
        ref(db, `${user.uid}/${DB_TOPIC_TREES}/${id}`),
        topicTree
      );
    } else {
      const guestTopicTrees = new Map(get()._guestTopicTrees).set(
        id,
        topicTree
      );
      saveGuestTopicTrees(guestTopicTrees);
      set({
        _guestTopicTrees: guestTopicTrees,
        currentTopicTree:
          id === get().currentMandalartId ? topicTree : get().currentTopicTree,
      });
    }
  },

  resetMandalart: async (id) => {
    if (!id) return;
    const user = get()._user;
    const emptyMeta = createEmptyMeta();
    const emptyTopicTree = createEmptyTopicTree();

    if (user) {
      // 원자적 쓰기로 meta와 topicTree를 동시에 초기화
      await fbUpdate(ref(db, user.uid), {
        [`${DB_SNIPPETS}/${id}`]: emptyMeta,
        [`${DB_TOPIC_TREES}/${id}`]: emptyTopicTree,
      });
    } else {
      const metaMap = new Map(get().metaMap).set(id, emptyMeta);
      const guestTopicTrees = new Map(get()._guestTopicTrees).set(
        id,
        emptyTopicTree
      );
      saveGuestMandalartMetas(metaMap);
      saveGuestTopicTrees(guestTopicTrees);
      set({
        metaMap,
        _guestTopicTrees: guestTopicTrees,
        currentTopicTree:
          id === get().currentMandalartId
            ? emptyTopicTree
            : get().currentTopicTree,
      });
    }
  },

  uploadTemp: async () => {
    const user = get()._user;
    if (!user) return;

    const guestMandalartMetas = loadGuestMandalartMetas();
    const guestTopicTrees = loadGuestTopicTrees();

    const firstKey = Array.from(guestMandalartMetas.keys()).shift();
    if (!firstKey) return;

    const meta = guestMandalartMetas.get(firstKey);
    const topicTree = guestTopicTrees.get(firstKey);
    if (!meta || !topicTree) return;

    if (!isAnyChanged(meta, topicTree)) return;

    // createMandalart보다 먼저 한도 체크하여 마이그레이션 전용 에러 메시지 사용
    const { metaMap } = get();
    if (metaMap.size + 1 > MAX_UPLOAD_MANDALARTS_SIZE) {
      throw new Error(
        i18next.t('mandalart.errors.uploadTemp.maxUploaded', {
          maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
        })
      );
    }

    await get().createMandalart(meta, topicTree);
    saveGuestMandalartMetas(new Map());
    saveGuestTopicTrees(new Map());
  },
}));

// -- Subscription hook --

export const useMandalartInit = (user: User | null) => {
  // Sync user ref to store
  useEffect(() => {
    useMandalartStore.setState({ _user: user });
  }, [user]);

  // User mode: subscribe to metas
  useEffect(() => {
    if (!user) return;

    useMandalartStore.setState({
      isLoading: true,
      metaMap: new Map(),
      currentMandalartId: null,
      currentTopicTree: null,
      error: null,
    });

    const unsub = onValue(
      ref(db, `${user.uid}/${DB_SNIPPETS}`),
      (snapshot) => {
        const map = new Map<string, MandalartMeta>();
        snapshot.forEach((child) => {
          if (child.key && child.val()) map.set(child.key, child.val());
        });
        useMandalartStore.getState()._setMandalartMetas(map);
        if (map.size === 0) {
          useMandalartStore.setState({ isLoading: false });
        }
      },
      (error) => useMandalartStore.setState({ error, isLoading: false })
    );

    return unsub;
  }, [user]);

  // User mode: subscribe to current topic tree
  const currentMandalartId = useMandalartStore((s) => s.currentMandalartId);

  // useEffect cleanup이 다음 effect 실행 전에 자동 호출되므로
  // onValue 반환값(unsubscribe)을 직접 cleanup으로 반환
  useEffect(() => {
    if (!user) return;

    if (!currentMandalartId) {
      useMandalartStore.setState({ currentTopicTree: null });
      return;
    }

    return onValue(
      ref(db, `${user.uid}/${DB_TOPIC_TREES}/${currentMandalartId}`),
      (snapshot) => {
        // selectMandalart로 ID가 이미 변경되었지만 이 구독의 useEffect cleanup이
        // 아직 실행되지 않은 경우, 폐기된 콜백이므로 무시
        if (useMandalartStore.getState().currentMandalartId !== currentMandalartId) return;

        const value: TopicNode | null = snapshot.val();
        useMandalartStore.setState({
          currentTopicTree: value,
          isLoading: false,
        });
      },
      (error) => useMandalartStore.setState({ error, isLoading: false })
    );
  }, [user, currentMandalartId]);

  // Guest mode: initialize from localStorage
  useEffect(() => {
    if (user) return;

    let metas = loadGuestMandalartMetas();
    let topicTrees = loadGuestTopicTrees();

    if (metas.size === 0) {
      // 첫 방문 또는 metas 손상: 기본 만다라트 생성
      metas = new Map([[TMP_MANDALART_ID, createEmptyMeta()]]);
      topicTrees = new Map([[TMP_MANDALART_ID, createEmptyTopicTree()]]);
      saveGuestMandalartMetas(metas);
      saveGuestTopicTrees(topicTrees);
    } else {
      // metas에 대응하는 topicTree가 없으면 빈 트리로 복구
      let recovered = false;
      for (const id of metas.keys()) {
        if (!topicTrees.has(id)) {
          topicTrees.set(id, createEmptyTopicTree());
          recovered = true;
        }
      }
      if (recovered) saveGuestTopicTrees(topicTrees);
    }

    useMandalartStore.setState({ _guestTopicTrees: topicTrees });
    useMandalartStore.getState()._setMandalartMetas(metas);

    const id = useMandalartStore.getState().currentMandalartId;
    if (id) {
      useMandalartStore.setState({
        currentTopicTree: topicTrees.get(id) ?? null,
      });
    }
    useMandalartStore.setState({ isLoading: false });
  }, [user]);
};
