import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUvNLVj7c4uTS97RMzl2cC0SW214OoHEc",
  authDomain: "queue-management-system-59e4b.firebaseapp.com",
  projectId: "queue-management-system-59e4b",
  storageBucket: "queue-management-system-59e4b.firebasestorage.app",
  messagingSenderId: "139979340194",
  appId: "1:139979340194:web:be5e914d395f0fffc31afb",
  measurementId: "G-SB49TWFME2"
};

let app, auth, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn("Firebase init failed (expected in dev without real credentials):", e);
  auth = null;
  googleProvider = null;
}

export { auth, googleProvider };
