import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrN5A4pDfakbbcCivKTh0BTqhSM_j_FHA",
  authDomain: "smart-farming-ae5ac.firebaseapp.com",
  projectId: "smart-farming-ae5ac",
  storageBucket: "smart-farming-ae5ac.firebasestorage.app",
  messagingSenderId: "237754311891",
  appId: "1:237754311891:web:c0f18b366e9aa28acb2026",
  measurementId: "G-J9S008B1BY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);