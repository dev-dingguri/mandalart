import { create } from 'zustand';
import {
  ref,
  push,
  set as fbSet,
  remove as fbRemove,
  onValue,
  Unsubscribe,
} from 'firebase/database';
import { User } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { db } from 'lib/firebase';
import i18next from 'i18next';
import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import {
  DB_SNIPPETS,
  DB_TOPIC_TREES,
  STORAGE_KEY_SNIPPETS,
  STORAGE_KEY_TOPIC_TREES,
  TMP_MANDALART_ID,
  EMPTY_SNIPPET,
  EMPTY_TOPIC_TREE,
  MAX_UPLOAD_MANDALARTS_SIZE,
} from 'constants/constants';

// -- localStorage helpers --

const loadGuestSnippets = (): Map<string, Snippet> => {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY_SNIPPETS) || '{}'
    );
    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
};

const saveGuestSnippets = (map: Map<string, Snippet>) => {
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

const isAnyChanged = (snippet: Snippet, topicTree: TopicNode) =>
  JSON.stringify(snippet) !== JSON.stringify(EMPTY_SNIPPET) ||
  JSON.stringify(topicTree) !== JSON.stringify(EMPTY_TOPIC_TREE);

// -- Store --

type MandalartState = {
  snippetMap: Map<string, Snippet>;
  currentMandalartId: string | null;
  currentTopicTree: TopicNode | null;
  isLoading: boolean;
  error: Error | null;

  selectMandalart: (id: string | null) => void;
  createMandalart: (snippet: Snippet, topicTree: TopicNode) => Promise<void>;
  deleteMandalart: (id: string | null) => Promise<void>;
  saveSnippet: (id: string | null, snippet: Snippet) => Promise<void>;
  saveTopicTree: (id: string | null, topicTree: TopicNode) => Promise<void>;
  uploadTemp: () => Promise<void>;

  // Internal
  _user: User | null;
  _guestTopicTrees: Map<string, TopicNode>;
  _setSnippets: (map: Map<string, Snippet>) => void;
};

export const useMandalartStore = create<MandalartState>((set, get) => ({
  snippetMap: new Map(),
  currentMandalartId: null,
  currentTopicTree: null,
  isLoading: true,
  error: null,
  _user: null,
  _guestTopicTrees: new Map(),

  selectMandalart: (id) => {
    const user = get()._user;
    if (user) {
      // User mode: topic tree will be loaded via subscription
      set({ currentMandalartId: id, currentTopicTree: null });
    } else {
      // Guest mode: look up from local map
      const topicTree = id ? get()._guestTopicTrees.get(id) ?? null : null;
      set({ currentMandalartId: id, currentTopicTree: topicTree });
    }
  },

  _setSnippets: (snippetMap) => {
    const { currentMandalartId, selectMandalart } = get();
    const isSelected =
      snippetMap.size === 0 ||
      (!!currentMandalartId && snippetMap.has(currentMandalartId));

    set({ snippetMap });
    if (!isSelected) {
      const lastId = Array.from(snippetMap.keys()).pop() ?? null;
      selectMandalart(lastId);
    }
  },

  createMandalart: async (snippet, topicTree) => {
    const user = get()._user;
    if (!user) {
      throw new Error(`${i18next.t('mandalart.errors.create.signInRequired')}`);
    }

    const { snippetMap } = get();
    if (snippetMap.size + 1 > MAX_UPLOAD_MANDALARTS_SIZE) {
      throw new Error(
        `${i18next.t('mandalart.errors.create.maxUploaded', {
          maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
        })}`
      );
    }

    const result = await push(
      ref(db, `${user.uid}/${DB_SNIPPETS}`),
      snippet
    );
    const mandalartId = result.key;
    if (!mandalartId) {
      throw new Error(`${i18next.t('mandalart.errors.create.default')}`);
    }

    set({ currentMandalartId: mandalartId });
    await fbSet(
      ref(db, `${user.uid}/${DB_TOPIC_TREES}/${mandalartId}`),
      topicTree
    );
  },

  deleteMandalart: async (id) => {
    const user = get()._user;
    if (!user || !id) return;

    await fbRemove(ref(db, `${user.uid}/${DB_SNIPPETS}/${id}`));
    await fbRemove(ref(db, `${user.uid}/${DB_TOPIC_TREES}/${id}`));
  },

  saveSnippet: async (id, snippet) => {
    if (!id) return;
    const user = get()._user;
    if (user) {
      await fbSet(ref(db, `${user.uid}/${DB_SNIPPETS}/${id}`), snippet);
    } else {
      const snippetMap = new Map(get().snippetMap).set(id, snippet);
      saveGuestSnippets(snippetMap);
      set({ snippetMap });
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

  uploadTemp: async () => {
    const user = get()._user;
    if (!user) return;

    const guestSnippets = loadGuestSnippets();
    const guestTopicTrees = loadGuestTopicTrees();

    const firstKey = Array.from(guestSnippets.keys()).shift();
    if (!firstKey) return;

    const snippet = guestSnippets.get(firstKey);
    const topicTree = guestTopicTrees.get(firstKey);
    if (!snippet || !topicTree) return;

    if (!isAnyChanged(snippet, topicTree)) return;

    try {
      await get().createMandalart(snippet, topicTree);
      saveGuestSnippets(new Map());
      saveGuestTopicTrees(new Map());
    } catch {
      throw new Error(
        `${i18next.t('mandalart.errors.uploadTemp.maxUploaded', {
          maxSize: MAX_UPLOAD_MANDALARTS_SIZE,
        })}`
      );
    }
  },
}));

// -- Subscription hook --

export const useMandalartInit = (user: User | null) => {
  const topicTreeUnsubRef = useRef<Unsubscribe | null>(null);

  // Sync user ref to store
  useEffect(() => {
    useMandalartStore.setState({ _user: user });
  }, [user]);

  // User mode: subscribe to snippets
  useEffect(() => {
    if (!user) return;

    useMandalartStore.setState({
      isLoading: true,
      snippetMap: new Map(),
      currentMandalartId: null,
      currentTopicTree: null,
      error: null,
    });

    const unsub = onValue(
      ref(db, `${user.uid}/${DB_SNIPPETS}`),
      (snapshot) => {
        const map = new Map<string, Snippet>();
        snapshot.forEach((child) => {
          if (child.key && child.val()) map.set(child.key, child.val());
        });
        useMandalartStore.getState()._setSnippets(map);
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

  useEffect(() => {
    if (!user) return;

    topicTreeUnsubRef.current?.();
    topicTreeUnsubRef.current = null;

    if (!currentMandalartId) {
      useMandalartStore.setState({ currentTopicTree: null });
      return;
    }

    topicTreeUnsubRef.current = onValue(
      ref(db, `${user.uid}/${DB_TOPIC_TREES}/${currentMandalartId}`),
      (snapshot) => {
        const value: TopicNode | null = snapshot.val();
        if (value) {
          useMandalartStore.setState({
            currentTopicTree: value,
            isLoading: false,
          });
        }
      },
      (error) => useMandalartStore.setState({ error })
    );

    return () => {
      topicTreeUnsubRef.current?.();
      topicTreeUnsubRef.current = null;
    };
  }, [user, currentMandalartId]);

  // Guest mode: initialize from localStorage
  useEffect(() => {
    if (user) return;

    let snippets = loadGuestSnippets();
    let topicTrees = loadGuestTopicTrees();

    if (snippets.size === 0 || topicTrees.size === 0) {
      snippets = new Map([[TMP_MANDALART_ID, EMPTY_SNIPPET]]);
      topicTrees = new Map([[TMP_MANDALART_ID, EMPTY_TOPIC_TREE]]);
      saveGuestSnippets(snippets);
      saveGuestTopicTrees(topicTrees);
    }

    useMandalartStore.setState({ _guestTopicTrees: topicTrees });
    useMandalartStore.getState()._setSnippets(snippets);

    const id = useMandalartStore.getState().currentMandalartId;
    if (id) {
      useMandalartStore.setState({
        currentTopicTree: topicTrees.get(id) ?? null,
      });
    }
    useMandalartStore.setState({ isLoading: false });
  }, [user]);
};
