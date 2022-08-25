import { firebaseDatabase } from './firebase';
import { ref, set, off, remove, onValue } from 'firebase/database';
import { TopicNode } from '../type/TopicNode';

class TopicRepository {
  saveTopics(userId: string, topics: TopicNode) {
    set(ref(firebaseDatabase, `${userId}/topics`), topics);
  }

  removeTopics(userId: string) {
    remove(ref(firebaseDatabase, `${userId}/topics`));
  }

  syncTopics(userId: string, onUpdate: (topicNode: TopicNode) => void) {
    const topicsRef = ref(firebaseDatabase, `${userId}/topics`);
    onValue(topicsRef, (snapshot) => {
      const val = snapshot.val();
      val && onUpdate(val);
    });
    // 콜백을 삭제하는 함수를 리턴해서 호출할 수 있도록 함
    return () => off(topicsRef);
  }
}

export default TopicRepository;
