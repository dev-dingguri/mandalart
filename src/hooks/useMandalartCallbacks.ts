import { useCallback } from 'react';
import { toast } from 'sonner';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { useLoadingStore } from '@/stores/useLoadingStore';
import { createEmptyMeta, createEmptyTopicTree } from '@/constants';
import { MandalartMeta, TopicNode } from '@/types';
import {
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
} from '@/lib/analyticsEvents';
import { useLatestRef } from '@/hooks/useLatestRef';
import type { TFunction } from 'i18next';

const LOADING_KEY_CREATE = 'mandalart:create';
const LOADING_KEY_DELETE = 'mandalart:delete';
const LOADING_KEY_RESET = 'mandalart:reset';

// useAppLayoutState가 아닌 이 파일에 정의하여 순환 의존성 방지
// (useAppLayoutState가 이 훅을 import하므로 타입도 여기에 있어야 함)
export type ConfirmDialogOptions = {
  message: string;
  confirmText: string;
  onConfirm: () => void;
};

export type RenameDialogOptions = {
  initialTitle: string;
  onConfirm: (name: string) => void;
};

type MandalartCallbackDeps = {
  openAlert: (msg: string) => void;
  openConfirmDialog: (options: ConfirmDialogOptions) => void;
  openRenameDialog: (options: RenameDialogOptions) => void;
  t: TFunction;
};

export const useMandalartCallbacks = ({
  openAlert,
  openConfirmDialog,
  openRenameDialog,
  t,
}: MandalartCallbackDeps) => {
  // 콜백 전용 — ref로 참조하여 콜백 재생성 방지 (rerender-defer-reads)
  const currentIdRef = useLatestRef(
    useMandalartStore((s) => s.currentMandalartId)
  );

  const selectMandalartId = useMandalartStore((s) => s.selectMandalart);
  const createMandalart = useMandalartStore((s) => s.createMandalart);
  const deleteMandalart = useMandalartStore((s) => s.deleteMandalart);
  const saveMandalartMeta = useMandalartStore((s) => s.saveMandalartMeta);
  const saveTopicTree = useMandalartStore((s) => s.saveTopicTree);
  const resetMandalart = useMandalartStore((s) => s.resetMandalart);

  // 저장 실패 시 사용자 작업 흐름을 방해하지 않도록 토스트로 피드백
  const showSaveError = useCallback(() => {
    toast.error(t('mandalart.errors.save.default'));
  }, [t]);

  const handleMetaChange = useCallback(
    (meta: MandalartMeta) => {
      saveMandalartMeta(currentIdRef.current, meta)?.catch(showSaveError);
    },
    [saveMandalartMeta, currentIdRef, showSaveError]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentIdRef.current, topicTree)?.catch(showSaveError);
    },
    [saveTopicTree, currentIdRef, showSaveError]
  );

  const handleCreate = useCallback(
    (afterSuccess?: () => void) => {
      const { conditions, addCondition, deleteCondition } = useLoadingStore.getState();
      if (conditions.get(LOADING_KEY_CREATE)) return;
      addCondition(LOADING_KEY_CREATE, true);
      createMandalart(createEmptyMeta(), createEmptyTopicTree())
        .then(() => {
          // trackMandalartCreate은 모듈 수준 함수라 의존성 배열에서 생략
          trackMandalartCreate();
          afterSuccess?.();
        })
        .catch((e: Error) => openAlert(e.message))
        .finally(() => deleteCondition(LOADING_KEY_CREATE));
    },
    [createMandalart, openAlert]
  );

  const handleSelect = useCallback(
    (mandalartId: string) => {
      selectMandalartId(mandalartId);
    },
    [selectMandalartId]
  );

  const handleDelete = useCallback(
    (mandalartId: string) => {
      openConfirmDialog({
        message: t('mandalart.confirmDelete'),
        confirmText: t('mandalart.delete'),
        onConfirm: () => {
          const { conditions, addCondition, deleteCondition } = useLoadingStore.getState();
          if (conditions.get(LOADING_KEY_DELETE)) return;
          addCondition(LOADING_KEY_DELETE, true);
          deleteMandalart(mandalartId)
            // trackMandalartDelete은 모듈 수준 함수라 의존성 배열에서 생략
            .then((deleted) => { if (deleted) trackMandalartDelete(); })
            .catch((e: Error) => openAlert(e.message))
            .finally(() => deleteCondition(LOADING_KEY_DELETE));
        },
      });
    },
    [openConfirmDialog, t, deleteMandalart, openAlert]
  );

  const handleRename = useCallback(
    (mandalartId: string) => {
      const meta = useMandalartStore.getState().metaMap.get(mandalartId);
      openRenameDialog({
        initialTitle: meta?.title ?? '',
        onConfirm: (name: string) => {
          saveMandalartMeta(mandalartId, { title: name })?.catch(showSaveError);
        },
      });
    },
    [openRenameDialog, saveMandalartMeta, showSaveError]
  );

  const handleReset = useCallback(
    (mandalartId: string) => {
      openConfirmDialog({
        message: t('mandalart.confirmReset'),
        confirmText: t('mandalart.reset'),
        onConfirm: () => {
          const { conditions, addCondition, deleteCondition } = useLoadingStore.getState();
          if (conditions.get(LOADING_KEY_RESET)) return;
          addCondition(LOADING_KEY_RESET, true);
          resetMandalart(mandalartId)
            // trackMandalartReset은 모듈 수준 함수라 의존성 배열에서 생략
            .then(() => trackMandalartReset())
            .catch((e: Error) => openAlert(e.message))
            .finally(() => deleteCondition(LOADING_KEY_RESET));
        },
      });
    },
    [openConfirmDialog, t, resetMandalart, openAlert]
  );

  return {
    onMetaChange: handleMetaChange,
    onTopicTreeChange: handleTopicTreeChange,
    onCreate: handleCreate,
    onSelect: handleSelect,
    onDelete: handleDelete,
    onRename: handleRename,
    onReset: handleReset,
  };
};
