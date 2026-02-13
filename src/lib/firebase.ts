// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhuxDPKYO1drSlDPtOXtKZLJjp2Kq-SMs",
  authDomain: "coloringkids-d1ab2.firebaseapp.com",
  projectId: "coloringkids-d1ab2",
  storageBucket: "coloringkids-d1ab2.firebasestorage.app",
  messagingSenderId: "823559314529",
  appId: "1:823559314529:web:f6084e2f5bdb96e2b0de20",
  measurementId: "G-M95EWCPTGF"
};

// Initialize Firebase
const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

export { firebaseApp, db };
