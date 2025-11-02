// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBncvjtg6L10XbHgSc69s0TkFii3vttzro",
  authDomain: "portfolio-website-b4972.firebaseapp.com",
  projectId: "portfolio-website-b4972",
  storageBucket: "portfolio-website-b4972.firebasestorage.app",
  messagingSenderId: "925314005519",
  appId: "1:925314005519:web:8c112fb5558935e43e417a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialise services and export instances
export const auth = getAuth(app);
export const db = getDatabase(app);


