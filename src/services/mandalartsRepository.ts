import { Snippet } from 'types/Snippet';
import { firebaseDatabase as db } from './firebase';
import { ref, set, remove, onValue, push } from 'firebase/database';
import { TopicNode } from 'types/TopicNode';

const SNIPPETS_PATH = '/mandalarts/snippets/';
const TOPIC_TREES_PATH = '/mandalarts/topictrees/';

class MandalartsRepository {
  createSnippet(userId: string, snippet: Snippet) {
    return push(ref(db, `${userId}${SNIPPETS_PATH}`), snippet);
  }

  saveSnippet(userId: string, mandalartId: string, snippet: Snippet) {
    return set(ref(db, `${userId}${SNIPPETS_PATH}${mandalartId}`), snippet);
  }

  deleteSnippet(userId: string, mandalartId: string) {
    return remove(ref(db, `${userId}${SNIPPETS_PATH}${mandalartId}`));
  }

  syncSnippets(
    userId: string,
    onUpdate: (snippetMap: Map<string, Snippet>) => void,
    onError?: (error: Error) => void
  ) {
    return onValue(
      ref(db, `${userId}${SNIPPETS_PATH}`),
      (snapshot) => {
        const snippetMap = new Map<string, Snippet>();
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key;
          const val = childSnapshot.val();
          key && snippetMap.set(key, val);
        });
        onUpdate(snippetMap);
      },
      onError
    );
  }

  saveTopics(userId: string, mandalartId: string, topicTree: TopicNode) {
    return set(
      ref(db, `${userId}${TOPIC_TREES_PATH}${mandalartId}`),
      topicTree
    );
  }

  deleteTopics(userId: string, mandalartId: string) {
    return remove(ref(db, `${userId}${TOPIC_TREES_PATH}${mandalartId}`));
  }

  syncTopics(
    userId: string,
    mandalartId: string,
    onUpdate: (topicTree: TopicNode) => void,
    onError?: (error: Error) => void
  ) {
    return onValue(
      ref(db, `${userId}${TOPIC_TREES_PATH}${mandalartId}`),
      (snapshot) => {
        const topicTree = snapshot.val();
        topicTree && onUpdate(topicTree);
      },
      onError
    );
  }
}

const mandalartRepository = new MandalartsRepository();
export default mandalartRepository;
