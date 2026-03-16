import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB136YHvNa_3IiOdcADszTZUdehqHCJaNY",
  authDomain: "x2sevenvault-db.firebaseapp.com",
  projectId: "x2sevenvault-db",
  storageBucket: "x2sevenvault-db.firebasestorage.app",
  messagingSenderId: "206254043518",
  appId: "1:206254043518:web:73919d9da5136566d4032f"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
