// import the firebase objects
import { db } from "./firebase-config";
import { auth } from "./firebase-config";

// import the specfic functions required
import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// Initialisation
let currentUser = null;

async function initialiseApp() {
    
}