# Firebase Realtime Database ↔ React 상태 동기화 — 발견된 문제

> 점검 일자: 2026-03-21
> 대상 브랜치: `rewrite/incremental`
> 관련 파일: `src/stores/useMandalartStore.ts`, `src/hooks/useMandalartCallbacks.ts`, `src/components/MandalartView.tsx`, `src/components/TopicGrid.tsx`

---

## 1. 셀 1개 수정 시 81개 전체 TopicItem 리렌더

**심각도:** 성능

`topicTree`는 73개 노드를 가진 단일 객체로 관리된다. 셀 하나의 텍스트만 변경해도 `onValue`가 전체 `topicTree`를 새 객체로 반환하며, 이로 인해 다음 연쇄가 발생한다:

1. `MandalartView`의 `handleGetTopic`/`handleUpdateTopic`이 `topicTree`에 의존하므로 매번 재생성
2. `Mandalart`(memo)에 전달되는 콜백 참조가 바뀌어 memo 무효화
3. 9개 `TopicGrid`(memo)도 같은 이유로 memo 무효화
4. `TopicGrid` 내부에서 `onUpdateTopic={(text) => onUpdateTopic(gridItemIdx, text)}`를 인라인 함수로 전달하여, 81개 `TopicItem`(memo)의 memo가 전부 무효화

이 문제는 Firebase 연동과 무관하게 게스트 모드에서도 동일하게 발생한다.

**재현 경로:**

```
MandalartView (topicTree prop 변경)
  → handleGetTopic/handleUpdateTopic 재생성 (useCallback 의존성: [topicTree])
    → Mandalart (memo 실패: 콜백 참조 변경)
      → TopicGrid ×9 (memo 실패: 콜백 참조 변경)
        → TopicItem ×81 (memo 실패: 인라인 onUpdateTopic 함수)
```

---

## 2. Firebase RTDB의 빈 배열 제거로 인한 leaf 노드 `children` 소실

**심각도:** 잠재적 런타임 에러

`createEmptyTopicTree()`가 생성하는 leaf 노드(level-2)는 `children: []`을 가진다. Firebase RTDB는 빈 배열을 저장하지 않고 제거하므로, `snapshot.val()`로 읽은 leaf 노드에는 `children` 프로퍼티 자체가 존재하지 않는다.

```typescript
// 저장 전 (로컬)
{ text: '목표', children: [] }

// Firebase 저장 후 읽기
{ text: '목표' }  // children 프로퍼티 없음
```

TypeScript 타입은 `TopicNode.children: TopicNode[]`로 선언되어 있지만, Firebase에서 읽은 leaf 노드의 `children`은 런타임에 `undefined`이다. **타입 시스템이 보장하는 것과 런타임 실제 데이터가 불일치**하는 상태.

현재 `getTopic()` 함수가 2단계까지만 탐색하므로 leaf의 `children`에 접근하지 않아 직접적인 에러는 없지만, 향후 leaf 노드에서 `node.children.length`, `node.children.forEach()` 등을 사용하는 코드가 추가되면 TypeError가 발생한다.

---

## 3. 만다라트 전환 시 ID-TopicTree 불일치 윈도우

**심각도:** 이론적 데이터 혼선

`selectMandalart(B)` 호출 후 `onValue(topictrees/B)` 콜백이 도착하기 전까지 짧은 윈도우가 존재한다:

- `currentMandalartId` = B (즉시 변경)
- `currentTopicTree` = A의 데이터 (아직 미변경, 빈 화면 방지 목적)

이 윈도우에서 `handleTopicTreeChange`가 호출되면:

1. `structuredClone(topicTree_A)` → 수정
2. `saveTopicTree(currentIdRef.current, modified_A)` — `currentIdRef`는 이미 B
3. **A의 데이터가 B의 Firebase 경로에 저장됨**

현재는 TextInputDialog 기반 편집이므로 이 윈도우에서 저장이 발생하기가 사실상 불가능하다. 또한 AppLayout의 `MandalartView`에 `key` prop이 없어서 만다라트 전환 시 컴포넌트가 재마운트되지 않고, 열려 있던 다이얼로그 상태가 유지되는 부수 문제도 있다.

---

## 4. 인증 모드와 게스트 모드의 비대칭적 상태 업데이트

**심각도:** 설계 일관성

`saveTopicTree`와 `saveMandalartMeta`가 모드에 따라 다른 업데이트 전략을 사용한다:

| | 인증 모드 | 게스트 모드 |
|---|---|---|
| **쓰기** | Firebase `fbSet` | localStorage 저장 |
| **store 반영** | `onValue` 콜백 (비동기, 간접) | `set()` 호출 (동기, 직접) |

인증 모드에서는 `saveTopicTree` 호출 후 store에 변경이 반영되기까지 Firebase 로컬 캐시 → `onValue` 콜백 → `setState` 경로를 거친다. Firebase SDK가 로컬 쓰기에 대해 `onValue`를 동기적으로 트리거하므로 현재는 실질적 문제가 없지만, 게스트 모드와 동작 보장 메커니즘이 다르다.

향후 인라인 편집(다이얼로그 없이 직접 입력)으로 UI가 변경되면, 인증 모드에서 React 리렌더 전에 다음 편집이 발생할 경우 이전 변경이 유실될 가능성이 생긴다.

---

## 5. 게스트 localStorage 스키마 버전 관리 없음

**심각도:** 마이그레이션 위험

`useMandalartStore.ts:27-29`에 TODO로 이미 표시되어 있음.

게스트 모드의 localStorage 데이터에 스키마 버전이 없다. `MandalartMeta`나 `TopicNode` 타입 구조가 변경되면 기존 localStorage 데이터와 호환되지 않을 수 있다. 현재 유일한 보호 장치는 `JSON.parse` 실패 시 빈 Map을 반환하는 try-catch뿐이며, 파싱은 성공하지만 구조가 달라진 경우(필드 추가/삭제/이름 변경)는 감지하지 못한다.

---

## 6. metaMap 전체 재빌드

**심각도:** 성능 (경미)

`onValue(snippets)` 콜백이 발생할 때마다 전체 `metaMap`을 새 Map 객체로 재빌드한다. 만다라트 하나의 제목만 변경해도 모든 항목을 순회하여 새 Map을 생성하고, metaMap을 구독하는 모든 컴포넌트가 새 참조를 받는다.

`useAppLayoutState`에서 개별 selector와 `metaEquals` (shallow 비교)로 대부분의 불필요한 리렌더를 방지하고 있으나, `metaMap` 자체를 직접 구독하는 컴포넌트(예: `MandalartListDrawer`)는 내용이 같아도 매번 리렌더된다.

`MAX_UPLOAD_MANDALARTS_SIZE`가 20이므로 실질적 성능 영향은 미미하다.
