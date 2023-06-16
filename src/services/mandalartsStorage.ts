import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import {
  STORAGE_KEY_SNIPPETS,
  STORAGE_KEY_TOPIC_TREES,
} from 'constants/constants';

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

  // todo: 단일 항목 저장 기능 추가
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
    const saved = this.storage.getItem(STORAGE_KEY_TOPIC_TREES);
    return saved
      ? new Map(Object.entries(JSON.parse(saved) as StorageTopics))
      : new Map<string, TopicNode>();
  }

  // todo: 단일 항목 저장 기능 추가
  saveTopics(topicsMap: Map<string, TopicNode>) {
    this.storage.setItem(
      STORAGE_KEY_TOPIC_TREES,
      JSON.stringify(Object.fromEntries(topicsMap))
    );
  }

  deleteTopics() {
    this.storage.removeItem(STORAGE_KEY_TOPIC_TREES);
  }
}

const mandalartsStorage = new MandalartsStorage(localStorage);
export default mandalartsStorage;
