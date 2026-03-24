import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadGuestMandalartMetas,
  saveGuestMandalartMetas,
  loadGuestTopicTrees,
  saveGuestTopicTrees,
  CURRENT_SCHEMA_VERSION,
} from '@/lib/guestStorage';
import { STORAGE_KEY_SNIPPETS, STORAGE_KEY_TOPIC_TREES } from '@/constants';
import { MandalartMeta, TopicNode } from '@/types';

const sampleMeta: MandalartMeta = { title: '목표' };
const sampleTree: TopicNode = {
  text: '핵심',
  children: Array.from({ length: 8 }, () => ({
    text: '',
    children: Array.from({ length: 8 }, () => ({ text: '', children: [] })),
  })),
};

describe('guestStorage', () => {
  beforeEach(() => localStorage.clear());

  describe('round-trip', () => {
    it('save -> load로 MandalartMeta를 정확히 복원한다', () => {
      const map = new Map([['id1', sampleMeta]]);
      saveGuestMandalartMetas(map);
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(map);
    });

    it('save -> load로 TopicNode를 정확히 복원한다', () => {
      const map = new Map([['id1', sampleTree]]);
      saveGuestTopicTrees(map);
      const loaded = loadGuestTopicTrees();
      expect(loaded).toEqual(map);
    });
  });

  describe('버전 없는 레거시 데이터 마이그레이션', () => {
    it('버전 래퍼 없이 직접 저장된 snippets를 v1으로 마이그레이션한다', () => {
      localStorage.setItem(
        STORAGE_KEY_SNIPPETS,
        JSON.stringify({ id1: sampleMeta }),
      );
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(new Map([['id1', sampleMeta]]));
    });

    it('버전 래퍼 없이 직접 저장된 topictrees를 v1으로 마이그레이션한다', () => {
      localStorage.setItem(
        STORAGE_KEY_TOPIC_TREES,
        JSON.stringify({ id1: sampleTree }),
      );
      const loaded = loadGuestTopicTrees();
      expect(loaded).toEqual(new Map([['id1', sampleTree]]));
    });

    it('마이그레이션 후 저장된 데이터에 버전 래퍼가 포함된다', () => {
      localStorage.setItem(
        STORAGE_KEY_SNIPPETS,
        JSON.stringify({ id1: sampleMeta }),
      );
      loadGuestMandalartMetas(); // 마이그레이션 트리거
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY_SNIPPETS)!);
      expect(raw.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(raw.data).toEqual({ id1: sampleMeta });
    });
  });

  describe('손상된 데이터 처리', () => {
    it('파싱 불가한 데이터에서 빈 Map을 반환한다', () => {
      localStorage.setItem(STORAGE_KEY_SNIPPETS, 'not json');
      expect(loadGuestMandalartMetas()).toEqual(new Map());
    });

    it('null 값에서 빈 Map을 반환한다', () => {
      expect(loadGuestMandalartMetas()).toEqual(new Map());
    });
  });

  describe('현재 버전 데이터', () => {
    it('현재 버전의 래퍼 데이터를 정상 로드한다', () => {
      const wrapped = {
        version: CURRENT_SCHEMA_VERSION,
        data: { id1: sampleMeta },
      };
      localStorage.setItem(STORAGE_KEY_SNIPPETS, JSON.stringify(wrapped));
      const loaded = loadGuestMandalartMetas();
      expect(loaded).toEqual(new Map([['id1', sampleMeta]]));
    });
  });
});
