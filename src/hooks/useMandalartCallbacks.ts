import { useCallback } from 'react';
import { useMandalartStore } from '@/stores/useMandalartStore';
import { createEmptyMeta, createEmptyTopicTree } from '@/constants';
import { MandalartMeta, TopicNode } from '@/types';
import {
  trackMandalartCreate,
  trackMandalartDelete,
  trackMandalartReset,
} from '@/lib/analyticsEvents';
import { useLatestRef } from '@/hooks/useLatestRef';
import type { TFunction } from 'i18next';

// useAppLayoutState가 아닌 이 파일에 정의하여 순환 의존성 방지
// (useAppLayoutState가 이 훅을 import하므로 타입도 여기에 있어야 함)
export type ConfirmDialogOptions = {
  message: string;
  confirmText: string;
  onConfirm: () => void;
};

type MandalartCallbackDeps = {
  openAlert: (msg: string) => void;
  openConfirmDialog: (options: ConfirmDialogOptions) => void;
  t: TFunction;
};

export const useMandalartCallbacks = ({
  openAlert,
  openConfirmDialog,
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

  const handleMetaChange = useCallback(
    (meta: MandalartMeta) => {
      saveMandalartMeta(currentIdRef.current, meta);
    },
    [saveMandalartMeta, currentIdRef]
  );

  const handleTopicTreeChange = useCallback(
    (topicTree: TopicNode) => {
      saveTopicTree(currentIdRef.current, topicTree);
    },
    [saveTopicTree, currentIdRef]
  );

  const handleCreate = useCallback(
    (afterSuccess?: () => void) => {
      createMandalart(createEmptyMeta(), createEmptyTopicTree())
        .then(() => {
          // trackMandalartCreate은 모듈 수준 함수라 의존성 배열에서 생략
          trackMandalartCreate();
          afterSuccess?.();
        })
        .catch((e: Error) => openAlert(e.message));
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
          deleteMandalart(mandalartId);
          // trackMandalartDelete은 모듈 수준 함수라 의존성 배열에서 생략
          trackMandalartDelete();
        },
      });
    },
    [openConfirmDialog, t, deleteMandalart]
  );

  const handleRename = useCallback(
    (mandalartId: string, name: string) => {
      saveMandalartMeta(mandalartId, { title: name });
    },
    [saveMandalartMeta]
  );

  const handleReset = useCallback(
    (mandalartId: string) => {
      openConfirmDialog({
        message: t('mandalart.confirmReset'),
        confirmText: t('mandalart.reset'),
        onConfirm: () => {
          saveMandalartMeta(mandalartId, createEmptyMeta());
          saveTopicTree(mandalartId, createEmptyTopicTree());
          // trackMandalartReset은 모듈 수준 함수라 의존성 배열에서 생략
          trackMandalartReset();
        },
      });
    },
    [openConfirmDialog, t, saveMandalartMeta, saveTopicTree]
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
