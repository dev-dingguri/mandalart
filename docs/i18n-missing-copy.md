# 누락된 UI 카피 (i18n)

locale 파일(`src/locales/resources/`) 검토 중 발견된 누락 문구 목록.
각 항목은 locale 추가 + 컴포넌트 작업이 함께 필요함.

---

## 1. 빈 상태 (Empty State)

만다라트가 0개일 때 목록 영역에 표시할 안내 문구.

**제안 키**: `mandalart.empty`

| 언어 | 문구 |
|------|------|
| ko | 새 만다라트를 추가해보세요 |
| en | Create your first Mandalart |
| ja | 新しいマンダラートを追加してみましょう |
| zh-CN | 开始创建您的第一个曼达拉图 |

---

## 2. 삭제 확인 다이얼로그

삭제는 되돌릴 수 없으므로 확인 단계 필요.

**제안 키**: `mandalart.dialogs.delete`

| 언어 | 제목 | 본문 |
|------|------|------|
| ko | 만다라트 삭제 | 삭제한 만다라트는 복구할 수 없습니다. 계속하시겠습니까? |
| en | Delete Mandalart | This action cannot be undone. Continue? |
| ja | マンダラートを削除 | 削除したマンダラートは元に戻せません。続けますか？ |
| zh-CN | 删除曼达拉图 | 删除后无法恢复。是否继续？ |

---

## 3. 초기화 확인 다이얼로그

초기화(reset)도 되돌릴 수 없으므로 확인 단계 필요.

**제안 키**: `mandalart.dialogs.reset`

| 언어 | 제목 | 본문 |
|------|------|------|
| ko | 만다라트 초기화 | 모든 내용이 지워집니다. 계속하시겠습니까? |
| en | Reset Mandalart | All content will be cleared. Continue? |
| ja | マンダラートをリセット | すべての内容が削除されます。続けますか？ |
| zh-CN | 重置曼达拉图 | 所有内容将被清除。是否继续？ |

---

## 4. 성공 피드백 (Toast)

작업 완료 후 토스트 알림.

**제안 키**: `mandalart.success`

| 키 | ko | en | ja | zh-CN |
|----|----|----|----|----|
| `saved` | 저장되었습니다 | Saved | 保存しました | 已保存 |
| `renamed` | 이름이 변경되었습니다 | Renamed | 名前を変更しました | 已重命名 |
| `deleted` | 삭제되었습니다 | Deleted | 削除しました | 已删除 |
| `reset` | 초기화되었습니다 | Reset | リセットしました | 已重置 |

> 현재 저장 성공 시 아무런 피드백이 없는 상태. 최소한 자동 저장 표시라도 필요.

---

## 5. 로딩 상태

데이터 불러오는 중 표시할 문구.

**제안 키**: `global.loading`

| 언어 | 문구 |
|------|------|
| ko | 불러오는 중... |
| en | Loading... |
| ja | 読み込み中... |
| zh-CN | 加载中... |
