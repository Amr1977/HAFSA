import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { api, setToken } from './api';
import { useAuthStore } from '../stores/authStore';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = async (roles?: string[]) => {
  const result = await signInWithPopup(auth, provider);
  const firebaseUser = result.user;

  const res: any = await api.post('/auth/login', {
    firebaseUid: firebaseUser.uid,
    email: firebaseUser.email,
    roles: roles || ['SOCIAL'],
  });

  setToken(res.accessToken);
  localStorage.setItem('auth_token', res.accessToken);
  const userData = await api.auth.getMe();
  useAuthStore.getState().login(res.accessToken, userData);

  return userData;
};
