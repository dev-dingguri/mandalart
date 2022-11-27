import { TABLE_SIZE } from 'constants/constants';
import { Snippet } from 'types/Snippet';
import { firebaseDatabase as db } from './firebase';
import { ref, set, off, remove, onValue, push } from 'firebase/database';
import { TopicNode } from 'types/TopicNode';

class MandalartRepository {
  newMandalart(userId: string) {
    const mandalartId = push(ref(db, `${userId}/mandalarts/snippets`), {
      title: 'Untitled',
    }).key;
    set(ref(db, `${userId}/mandalarts/topics/${mandalartId}`), {
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
    remove(ref(db, `${userId}/mandalarts/snippets/${mandalartId}`));
    remove(ref(db, `${userId}/mandalarts/topics/${mandalartId}`));
  }

  saveSnippets(userId: string, mandalartId: string, snippet: Snippet) {
    set(ref(db, `${userId}/mandalarts/snippets/${mandalartId}`), snippet);
  }

  syncSnippets(
    userId: string,
    onUpdate: (snippetMap: Map<string, Snippet>) => void,
    onError?: (error: Error) => void
  ) {
    const snippetsRef = ref(db, `${userId}/mandalarts/snippets`);
    onValue(
      snippetsRef,
      (snapshot) => {
        const snippetMap = new Map<string, Snippet>();
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key;
          const val = childSnapshot.val();
          key && snippetMap.set(key, val);
        });
        if (snippetMap.size) {
          onUpdate(snippetMap);
        } else {
          onError && onError(new Error('snapshot is empty'));
        }
      },
      onError
    );
    // 콜백을 삭제하는 함수를 리턴해서 호출할 수 있도록 함
    return () => off(snippetsRef);
  }

  saveTopics(userId: string, mandalartId: string, topicTree: TopicNode) {
    set(ref(db, `${userId}/mandalarts/topics/${mandalartId}`), topicTree);
  }

  removeTopics(userId: string, mandalartId: string) {
    remove(ref(db, `${userId}/mandalarts/topics/${mandalartId}`));
  }

  syncTopics(
    userId: string,
    mandalartId: string,
    onUpdate: (topicTree: TopicNode) => void,
    onError?: (error: Error) => void
  ) {
    const topicsRef = ref(db, `${userId}/mandalarts/topics/${mandalartId}`);
    onValue(
      topicsRef,
      (topicTree) => {
        const val = topicTree.val();
        if (val) {
          onUpdate(val);
        } else {
          onError && onError(new Error('snapshot is empty'));
        }
      },
      onError
    );
    // 콜백을 삭제하는 함수를 리턴해서 호출할 수 있도록 함
    return () => off(topicsRef);
  }
}

const mandalartRepository = new MandalartRepository();
export default mandalartRepository;
