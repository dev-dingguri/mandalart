import { TABLE_SIZE } from 'common/const';
import { MandalartMetadata } from 'types/MandalartMetadata';
import { firebaseDatabase as db } from './firebase';
import { ref, set, off, remove, onValue, push } from 'firebase/database';
import { TopicNode } from 'types/TopicNode';

class MandalartRepository {
  newMandalart(userId: string) {
    const mandalartId = push(ref(db, `${userId}/mandalart/metadata`), {
      title: 'Untitled',
    }).key;
    set(ref(db, `${userId}/mandalart/topics/${mandalartId}`), {
      text: '',
      children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
        text: '',
        children: Array.from({ length: TABLE_SIZE - 1 }, () => ({
          text: '',
          children: [],
        })),
      })),
    });
    return mandalartId;
  }

  removeMandalart(userId: string, mandalartId: string) {
    remove(ref(db, `${userId}/mandalart/metadata/${mandalartId}`));
    remove(ref(db, `${userId}/mandalart/topics/${mandalartId}`));
  }

  saveMetadata(
    userId: string,
    mandalartId: string,
    metadata: MandalartMetadata
  ) {
    set(ref(db, `${userId}/mandalart/metadata/${mandalartId}`), metadata);
  }

  syncMetadata(
    userId: string,
    onUpdate: (metadataMap: Map<string, MandalartMetadata>) => void
  ) {
    const metadataRef = ref(db, `${userId}/mandalart/metadata`);
    onValue(metadataRef, (snapshot) => {
      const metadataMap = new Map<string, MandalartMetadata>();
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const val = childSnapshot.val();
        key && metadataMap.set(key, val);
      });
      onUpdate(metadataMap);
    });
    // 콜백을 삭제하는 함수를 리턴해서 호출할 수 있도록 함
    return () => off(metadataRef);
  }

  saveTopics(userId: string, mandalartId: string, topicTree: TopicNode) {
    set(ref(db, `${userId}/mandalart/topics/${mandalartId}`), topicTree);
  }

  removeTopics(userId: string, mandalartId: string) {
    remove(ref(db, `${userId}/mandalart/topics/${mandalartId}`));
  }

  syncTopics(
    userId: string,
    mandalartId: string,
    onUpdate: (topicNode: TopicNode) => void
  ) {
    const topicsRef = ref(db, `${userId}/mandalart/topics/${mandalartId}`);
    onValue(topicsRef, (snapshot) => {
      const val = snapshot.val();
      val && onUpdate(val);
    });
    // 콜백을 삭제하는 함수를 리턴해서 호출할 수 있도록 함
    return () => off(topicsRef);
  }
}

const mandalartRepository = new MandalartRepository();
export default mandalartRepository;
