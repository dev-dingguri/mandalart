import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';

// common constants

// mandalart ui
export const TABLE_ROW_SIZE = 3;
export const TABLE_COL_SIZE = 3;
export const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
export const TABLE_CENTER_IDX = 4;

// mandalart constraint
export const MAX_UPLOAD_MANDALARTS_SIZE = 20;
export const MAX_MANDALART_TITLE_SIZE = 50;
export const MAX_TOPIC_TEXT_SIZE = 50;

// mandalart data
export const TMP_MANDALART_ID = 'tmp_mandalart_id';

export const EMPTY_SNIPPET: Snippet = {
  title: '',
};
export const EMPTY_TOPIC_TREE: TopicNode = {
  text: '',
  children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
    text: '',
    children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
      text: '',
      children: [],
    })),
  })),
};

// database path
export const DB_SNIPPETS = 'mandalarts/snippets';
export const DB_TOPIC_TREES = 'mandalarts/topictrees';

// storage keys
export const STORAGE_KEY_SNIPPETS = 'mandalarts__snippets';
export const STORAGE_KEY_TOPIC_TREES = 'mandalarts__topictrees';
export const STORAGE_KEY_SIGN_IN_SESSION = 'sign_in_session';

// url
export const PATH_OSS = '/oss';
