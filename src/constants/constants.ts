import { Snippet } from 'types/Snippet';
import { TopicNode } from 'types/TopicNode';
import i18n from 'locales/i18n';

// common constants

// mandalart ui
export const TABLE_ROW_SIZE = 3;
export const TABLE_COL_SIZE = 3;
export const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
export const TABLE_CENTER_IDX = 4;

// mandalart constraint
export const MAX_UPLOAD_MANDALARTS_SIZE = 20;
export const MAX_MANDALART_TITLE_SIZE = 30;
export const MAX_TOPIC_TEXT_SIZE = 50;

// mandalart data
export const TMP_MANDALART_ID = 'tmp_mandalart_id';

export const DEFAULT_SNIPPET: Snippet = {
  title: i18n.t('mandalart.snippet.untitled'),
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
export const STORAGE_KEY_TOPIC_TREES = 'mandalarts__topictrees';

// url
export const PATH_HOME = '';
export const PATH_OSS = '/oss';
