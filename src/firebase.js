import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3TwnwHj8BJx31NHWxbPhRNQcHeCddHMcI",
  authDomain: "school-lost-found-ed8fe.firebaseapp.com",
  projectId: "school-lost-found-ed8fe",
  storageBucket: "school-lost-found-ed8fe.firebasestorage.app",
  messagingSenderId: "972697587058",
  appId: "1:972697587058:web:38f7724ab4323b4011e1eb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);