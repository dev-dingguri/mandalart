import { User } from 'firebase/auth';
import { TopicNode } from 'types/TopicNode';
import { useDatabase, useDatabaseObjectData } from 'reactfire';
import { DB_TOPIC_TREES_PATH } from 'constants/constants';
import { ref, set, remove } from 'firebase/database';
import { useMemo } from 'react';

// todo: mandalartId가 있는 컴포넌트에서 호출(mandalartId 타입을 string | null -> string으로 변경)
const useUserTopics = (user: User, mandalartId: string | null) => {
  const db = useDatabase();
  // ref 바뀔때마다 다시 로딩할 필요가 있음
  const {
    status,
    data: topicTree,
    error,
  } = useDatabaseObjectData<TopicNode | null>(
    ref(db, `${user.uid}${DB_TOPIC_TREES_PATH}${mandalartId}`)
  );

  console.log(`mandalartId=${mandalartId}`);
  console.log(`status=${status}`);
  console.log(`topicTree=${topicTree}`);

  const isLoading = status === 'loading';

  // todo: 분리 검토
  const handlers = useMemo(() => {
    return {
      set: (value: TopicNode) =>
        set(ref(db, `${user.uid}${DB_TOPIC_TREES_PATH}${mandalartId}`), value),
      remove: (mandalartId: string) =>
        remove(ref(db, `${user.uid}${DB_TOPIC_TREES_PATH}${mandalartId}`)),
    };
  }, [db, user.uid, mandalartId]);

  return { topicTree, isLoading, error, ...handlers };
};

export default useUserTopics;
