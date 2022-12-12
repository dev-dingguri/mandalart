import { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { TopicNode } from 'types/TopicNode';
import useBoolean from 'hooks/useBoolean';
import { Snippet } from 'types/Snippet';
import {
  TMP_MANDALART_ID,
  DEFAULT_SNIPPET,
  DEFAULT_TOPIC_TREE,
} from 'constants/constants';
import { isEqual } from 'lodash';
import mandalartsStorage from '../services/mandalartsStorage';

const useStorageUploader = (
  createMandalart: (
    user: User | null,
    snippet: Snippet,
    topicTree: TopicNode
  ) => Promise<void>
) => {
  const [isUploading, { on: startUploading, off: endUploading }] =
    useBoolean(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    (user: User | null) => {
      if (!user) return;

      const savedSnippet = mandalartsStorage
        .readSnippets()
        .get(TMP_MANDALART_ID);
      const snippet = savedSnippet ? savedSnippet : DEFAULT_SNIPPET;
      const savedTopicTree = mandalartsStorage
        .readTopics()
        .get(TMP_MANDALART_ID);
      const topicTree = savedTopicTree ? savedTopicTree : DEFAULT_TOPIC_TREE;

      if (!isAnyChanged(snippet, topicTree)) return;

      startUploading();
      setError(null);
      createMandalart(user, snippet, topicTree)
        .then(() => {
          mandalartsStorage.deleteSnippets();
          mandalartsStorage.deleteTopics();
        })
        .catch((e: Error) => {
          setError(e);
        })
        .finally(() => endUploading());
    },
    [startUploading, endUploading, createMandalart]
  );

  return [upload, isUploading, error] as const;
};

const isAnyChanged = (snippet: Snippet, topicTree: TopicNode) => {
  return (
    !isEqual(snippet, DEFAULT_SNIPPET) || //
    !isEqual(topicTree, DEFAULT_TOPIC_TREE)
  );
};

export default useStorageUploader;
