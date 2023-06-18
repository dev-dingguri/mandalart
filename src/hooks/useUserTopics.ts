import { User } from 'firebase/auth';
import { TopicNode } from 'types/TopicNode';
import { useDatabase, useDatabaseObjectData } from 'reactfire';
import { ref } from 'firebase/database';

const TOPIC_TREES_PATH = '/mandalarts/topictrees/';

const useUserTopics = (user: User, mandalartId: string | null) => {
  const database = useDatabase();
  const topicsRef = ref(
    database,
    `${user.uid}${TOPIC_TREES_PATH}${mandalartId}`
  );
  const {
    status,
    data: topicTree,
    error,
  } = useDatabaseObjectData<TopicNode | null>(topicsRef);

  const isLoading = status === 'loading';

  return { topicTree, isLoading, error };
};

export default useUserTopics;
