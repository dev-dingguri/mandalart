import { firebaseAuth } from './firebase';
import {
  GoogleAuthProvider,
  User,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

class AuthService {
  // todo: BaseOAuthProvider[] 멤버를 가지고 구현체는 주입 받는것 검토
  private googleProvider = new GoogleAuthProvider();

  signIn(providerId: string) {
    const authProvider = this.getProvider(providerId);
    signInWithRedirect(firebaseAuth, authProvider);
  }

  signOut() {
    firebaseAuth.signOut();
  }

  getRedirectResult() {
    return getRedirectResult(firebaseAuth);
  }

  onAuthStateChanged(observer: (user: User | null) => void) {
    return firebaseAuth.onAuthStateChanged((user) => {
      observer(user);
    });
  }

  getProvider(providerId: string) {
    switch (providerId) {
      case this.googleProvider.providerId:
        return this.googleProvider;
      default:
        throw new Error('not support provider');
    }
  }
}

const authService = new AuthService();
export default authService;
