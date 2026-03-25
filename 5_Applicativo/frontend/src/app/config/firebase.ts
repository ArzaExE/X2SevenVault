// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB136YHvNa_3IiOdcADszTZUdehqHCJaNY",
  authDomain: "x2sevenvault-db.firebaseapp.com",
  databaseURL: "https://x2sevenvault-db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "x2sevenvault-db",
  storageBucket: "x2sevenvault-db.firebasestorage.app",
  messagingSenderId: "206254043518",
  appId: "1:206254043518:web:4aec2734c47aeaced4032f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);