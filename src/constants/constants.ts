import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';

// common constants

// ui
export const TABLE_ROW_SIZE = 3;
export const TABLE_COL_SIZE = 3;
export const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
export const TABLE_CENTER_IDX = 4;

// db constraint
export const MAX_UPLOAD_MANDALARTS_SIZE = 20;

// data
export const TMP_MANDALART_ID = 'tmp_mandalart_id';

export const DEFAULT_SNIPPET: Snippet = {
  title: 'Untitled',
};
export const DEFAULT_TOPIC_TREE: TopicNode = {
  text: '',
  children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
    text: '',
    children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
      text: '',
      children: [],
    })),
  })),
};

// storage keys
export const STORAGE_KEY_SNIPPETS = 'mandalarts__snippets';
export const STORAGE_KEY_TOPICS = 'mandalarts__topics';
