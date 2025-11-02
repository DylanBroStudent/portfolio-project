// Import the functions you need from the SDKs you need
import { loadComponent } from "../component-manager.js"
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBncvjtg6L10XbHgSc69s0TkFii3vttzro",
  authDomain: "portfolio-website-b4972.firebaseapp.com",
  databaseURL: "https://portfolio-website-b4972-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-website-b4972",
  storageBucket: "portfolio-website-b4972.firebasestorage.app",
  messagingSenderId: "925314005519",
  appId: "1:925314005519:web:8c112fb5558935e43e417a"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialise services and export instances
const auth = getAuth(app);
const database = getDatabase(app);

// Global reference for the current user
let currentUser = null;

// Load comment section component
async function startApp() {
    await loadComponent("comment-section-placeholder", "/components/comment-section/comment-section.html");
    initialiseCommentSection();
}

function initialiseCommentSection() {
  // UI Element References
  const loginContainer = document.getElementById('login-container');
  const commentSectionContainer = document.getElementById('comment-section-container');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userDisplayName = document.getElementById('user-display-name');
  const commentForm = document.getElementById('comment-form');

  // Listen for changes in the user's authentication state and update the UI.
  onAuthStateChanged(auth, (user) => {
      if (user) {
          currentUser = user;
          loginContainer.style.display = 'none';
          commentSectionContainer.style.display = 'block';
          userDisplayName.textContent = user.displayName;
      } else {
          currentUser = null;
          loginContainer.style.display = 'block';
          commentSectionContainer.style.display = 'none';
      }
  });

  // Initiates the Google Sign-In process when the login button is clicked.
  loginBtn.addEventListener('click', () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
          .catch((error) => console.error("Login Error:", error.message));
  });

  // Signs the user out when the logout button is clicked.
  logoutBtn.addEventListener('click', () => {
      signOut(auth);
  });

  // Handles the submission of the comment form.
  commentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("Form submitted!");

      const commentTextInput = document.getElementById('comment-text');
      const commentText = commentTextInput.value;
      console.log("Current user object:", currentUser);
      console.log("Comment text:", commentText);

      if (currentUser && commentText.trim() !== '') {
          handleCommentSubmit(commentText);
          commentTextInput.value = ''; // Clear input after submission
      } else {
          console.error("Condition failed: Either no user is logged in or the comment text is empty.");
      }
  });

  // Activates the real-time listener for displaying comments.
  listenForComments();
}

function listenForComments() {
    const commentsRef = ref(database, 'comments');
    const container = document.getElementById('comments-container');
    
    onValue(commentsRef, (snapshot) => {
        container.innerHTML = '<h1>Comments</h1>'; // Clear previous comments
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const commentData = childSnapshot.val();
                const commentElement = createCommentElement(commentData);
                container.appendChild(commentElement);
            });
        } else {
            container.innerHTML += '<p>Be the first to comment!</p>';
        }
    });
}

// Writes a new comment object to the Firebase Realtime Database.
function handleCommentSubmit(text) {
    console.log("handleCommentSubmit function called!"); 
    const commentsRef = ref(database, 'comments');
    
    const commentData = {
        uid: currentUser.uid,
        authorName: currentUser.displayName,
        text: text,
        timestamp: serverTimestamp()
    };
    console.log("Attempting to write this data:", commentData); 

    set(push(commentsRef), commentData)
        .then(() => {
            console.log("SUCCESS: Data written to Firebase."); 
        })
        .catch((error) => {
            // THIS IS A CRITICAL CHECK
            console.error("FIREBASE ERROR: Failed to write data.", error); 
        });
}

// Creates an HTML element for a single comment.
function createCommentElement(data) {
    console.log("handleCommentSubmit function called!");
    const div = document.createElement('div');
    div.classList.add('comment');
    div.innerHTML = `
          <div class="comment-container">
            <h2>${data.authorName}</h2>
            <p class="comment-text">${data.text}</p>
          </div>
    `;
    return div;
}

document.addEventListener("DOMContentLoaded", startApp);