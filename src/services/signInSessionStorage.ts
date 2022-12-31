import { User } from 'firebase/auth';

const SIGN_IN_SESSION = 'sign_in_session';

type SignInSessionData = {
  isTriedUploadDraft: boolean;
};

type SignInSessionsData = {
  [uid: string]: SignInSessionData;
};

const DEFAULT_SIGN_IN_SESSION_DATA: SignInSessionData = {
  isTriedUploadDraft: false,
};

class SignInSessionStorage {
  constructor(private storage: Storage) {}

  initial(user: User) {
    this.save(user, DEFAULT_SIGN_IN_SESSION_DATA);
  }

  read(user: User) {
    if (!user) return null;
    const read = this.readAll()[user.uid];
    return read ? read : null;
  }

  save(user: User, data: SignInSessionData) {
    if (!user) return;
    const saved = this.readAll();
    saved[user.uid] = data;
    this.storage.setItem(SIGN_IN_SESSION, JSON.stringify(saved));
  }

  private readAll() {
    const saved = this.storage.getItem(SIGN_IN_SESSION);
    return saved ? (JSON.parse(saved) as SignInSessionsData) : {};
  }
}

const signInSessionStorage = new SignInSessionStorage(localStorage);
export default signInSessionStorage;
