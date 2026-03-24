import { MandalartMeta, TopicNode } from '@/types';

// table ui
export const TABLE_ROW_SIZE = 3;
export const TABLE_COL_SIZE = 3;
export const TABLE_SIZE = TABLE_ROW_SIZE * TABLE_COL_SIZE;
// 3×3 그리드의 중앙 인덱스는 크기에서 파생
export const TABLE_CENTER_IDX = Math.floor(TABLE_SIZE / 2);

// constraints
export const MAX_UPLOAD_MANDALARTS_SIZE = 20;
export const MAX_MANDALART_TITLE_SIZE = 50;
export const MAX_TOPIC_TEXT_SIZE = 50;

// defaults
export const TMP_MANDALART_ID = 'tmp_mandalart_id';

export function createEmptyMeta(): MandalartMeta {
  return { title: '' };
}

export function createEmptyTopicTree(): TopicNode {
  return {
    text: '',
    children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
      text: '',
      children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
        text: '',
        children: [],
      })),
    })),
  };
}
