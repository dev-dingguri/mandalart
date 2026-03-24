import { MandalartMeta, TopicNode } from '@/types';
import { STORAGE_KEY_SNIPPETS, STORAGE_KEY_TOPIC_TREES } from '@/constants';

// 현재 스키마 버전 — 타입 구조 변경 시 올리고 마이그레이션 함수 추가
export const CURRENT_SCHEMA_VERSION = 1;

type VersionedData<T> = {
  version: number;
  data: Record<string, T>;
};

// 마이그레이션 레지스트리: 키는 "from version", 값은 data를 변환하는 함수
// 예: 향후 MandalartMeta에 color 필드를 추가하면
//   migrations[1] = (data) => mapValues(data, m => ({ ...m, color: 'default' }))
// 후 CURRENT_SCHEMA_VERSION을 2로 올린다.
type Migration<T> = (data: Record<string, T>) => Record<string, T>;

const metaMigrations: Record<number, Migration<MandalartMeta>> = {};
const treeMigrations: Record<number, Migration<TopicNode>> = {};

function load<T>(
  key: string,
  migrations: Record<number, Migration<T>>,
): Map<string, T> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Map();

    const parsed = JSON.parse(raw);

    let version: number;
    let data: Record<string, T>;

    if (parsed && typeof parsed.version === 'number' && parsed.data) {
      // 버전 래퍼가 있는 새 형식
      version = parsed.version;
      data = parsed.data;
    } else if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed)
    ) {
      // 버전 래퍼 없는 레거시 형식 → v1으로 취급
      version = 1;
      data = parsed;
    } else {
      return new Map();
    }

    // 순차적 마이그레이션 적용
    while (version < CURRENT_SCHEMA_VERSION) {
      const migrate = migrations[version];
      if (!migrate) break; // 마이그레이션 함수가 없으면 중단 (데이터 보존)
      data = migrate(data);
      version++;
    }

    // 레거시 형식이거나 마이그레이션이 발생했으면 새 형식으로 재저장
    const isLegacy = typeof parsed.version !== 'number';
    if (isLegacy || version !== parsed.version) {
      save(key, new Map(Object.entries(data)));
    }

    return new Map(Object.entries(data));
  } catch {
    return new Map();
  }
}

function save<T>(key: string, map: Map<string, T>): void {
  const wrapped: VersionedData<T> = {
    version: CURRENT_SCHEMA_VERSION,
    data: Object.fromEntries(map),
  };
  localStorage.setItem(key, JSON.stringify(wrapped));
}

// -- Public API --

export const loadGuestMandalartMetas = (): Map<string, MandalartMeta> =>
  load<MandalartMeta>(STORAGE_KEY_SNIPPETS, metaMigrations);

export const saveGuestMandalartMetas = (
  map: Map<string, MandalartMeta>,
): void => save(STORAGE_KEY_SNIPPETS, map);

export const loadGuestTopicTrees = (): Map<string, TopicNode> =>
  load<TopicNode>(STORAGE_KEY_TOPIC_TREES, treeMigrations);

export const saveGuestTopicTrees = (map: Map<string, TopicNode>): void =>
  save(STORAGE_KEY_TOPIC_TREES, map);
