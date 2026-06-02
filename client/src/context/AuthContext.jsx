import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase auth isn't available (missing credentials), immediately unblock loading
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) {
      alert("Firebase is not configured. Please use the Guest Login option, or add your Firebase credentials to client/src/firebase.js");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      uid: "guest_" + Math.random().toString(36).substr(2, 9),
      displayName: "Guest User",
      email: "guest@noqueue.app",
      photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"
    };
    setUser(guestUser);
  };

  const logout = () => {
    setUser(null);
    if (auth) signOut(auth).catch(() => {});
  };

  const value = {
    user,
    loginWithGoogle,
    loginAsGuest,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
