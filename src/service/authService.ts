import { firebaseAuth } from './firebase';
import { GoogleAuthProvider, User, signInWithPopup } from 'firebase/auth';

class AuthService {
  // todo: BaseOAuthProvider[] 멤버를 가지고 구현체는 주입 받는것 검토
  private googleProvider = new GoogleAuthProvider();

  signIn(providerId: string) {
    const authProvider = this.getProvider(providerId);
    // todo: 모바일 환경은 리디렉션
    return signInWithPopup(firebaseAuth, authProvider);
  }

  signOut() {
    firebaseAuth.signOut();
  }

  onAuthStateChanged(observer: (user: User | null) => void) {
    firebaseAuth.onAuthStateChanged((user) => {
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
