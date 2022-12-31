import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import { STORAGE_KEY_SNIPPETS, STORAGE_KEY_TOPICS } from 'constants/constants';

type StorageSnippets = {
  [mandalartId: string]: Snippet;
};

type StorageTopics = {
  [mandalartId: string]: TopicNode;
};

class MandalartsStorage {
  constructor(private storage: Storage) {}

  readSnippets() {
    const saved = this.storage.getItem(STORAGE_KEY_SNIPPETS);
    return saved
      ? new Map(Object.entries(JSON.parse(saved) as StorageSnippets))
      : new Map<string, Snippet>();
  }

  saveSnippets(snippetMap: Map<string, Snippet>) {
    this.storage.setItem(
      STORAGE_KEY_SNIPPETS,
      JSON.stringify(Object.fromEntries(snippetMap))
    );
  }

  deleteSnippets() {
    this.storage.removeItem(STORAGE_KEY_SNIPPETS);
  }

  readTopics() {
    const saved = this.storage.getItem(STORAGE_KEY_TOPICS);
    return saved
      ? new Map(Object.entries(JSON.parse(saved) as StorageTopics))
      : new Map<string, TopicNode>();
  }

  saveTopics(topicsMap: Map<string, TopicNode>) {
    this.storage.setItem(
      STORAGE_KEY_TOPICS,
      JSON.stringify(Object.fromEntries(topicsMap))
    );
  }

  deleteTopics() {
    this.storage.removeItem(STORAGE_KEY_TOPICS);
  }
}

const mandalartsStorage = new MandalartsStorage(localStorage);
export default mandalartsStorage;
