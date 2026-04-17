// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_dySiTgLzuI5-LE9GN3mtfWw5JDyWM0E",
  authDomain: "mf-advisor-auth.firebaseapp.com",
  projectId: "mf-advisor-auth",
  storageBucket: "mf-advisor-auth.firebasestorage.app",
  messagingSenderId: "871485299077",
  appId: "1:871485299077:web:5e26005790beca95c48cec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);