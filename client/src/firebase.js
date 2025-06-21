// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "rentpal-7db0b.firebaseapp.com",
  projectId: "rentpal-7db0b",
  storageBucket: "rentpal-7db0b.firebasestorage.app",
  messagingSenderId: "88253238659",
  appId: "1:88253238659:web:103b141a12161e2f35bab6",
  measurementId: "G-FVT9BC4WGE"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);