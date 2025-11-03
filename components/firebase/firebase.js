// Import the functions you need from the SDKs you need
import { loadComponent } from "../component-manager.js"
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, serverTimestamp, update, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

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
let projectId = null;

// Load comment section component
async function startApp() {
    // get the placeholder element
    const placeholder = document.getElementById("comment-section-placeholder");
    if (!placeholder) return console.error("Comment placeholder not found!");
    // get the project id
    projectId = placeholder.dataset.projectId;
    if (!projectId) return console.error("data-project-id attribute is missing!");

    console.log(`Initializing comments for post: ${projectId}`);

    await loadComponent("comment-section-placeholder", "/components/comment-section/comment-section.html");
    initialiseCommentSection();
}

function initialiseCommentSection() {
    // UI Element References
    const loginContainer = document.getElementById('login-container');
    const commentSectionContainer = document.getElementById('comment-section-container');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const commentsContainer = document.getElementById('comments-container');
    const userDisplayName = document.getElementById('user-display-name');
    const commentForm = document.getElementById('comment-form');

    // Listen for changes in the user's authentication state and update the UI.
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        listenForComments();
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

    commentsContainer.addEventListener('click', (e) => {
        // Check if the clicked element has the class 'edit-btn'
        if (e.target.matches('.edit-btn')) {
            const commentElement = e.target.closest('.comment-container');
            const commentId = commentElement.dataset.id;
            handleCommentUpdate(commentId);
        }

        // Check if the clicked element has the class 'delete-btn'
        if (e.target.matches('.delete-btn')) {
            const commentElement = e.target.closest('.comment-container');
            const commentId = commentElement.dataset.id;
            handleCommentDelete(commentId);
        }
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
    const commentsRef = ref(database, `comments/${projectId}`);
    const container = document.getElementById('comments-container');

    onValue(commentsRef, (snapshot) => {
        container.innerHTML = '<h2>Comments</h2>';
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const commentId = childSnapshot.key; // Get the unique key
                const commentData = childSnapshot.val();
                // Pass both the ID and the data to the create function
                const commentElement = createCommentElement(commentId, commentData);
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
    const commentsRef = ref(database, `comments/${projectId}`);

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
            console.error("FIREBASE ERROR: Failed to write data.", error);
        });
}

function handleCommentUpdate(commentId) {
    const newText = prompt("Enter your new comment text:");
    // Proceed only if the user entered text and didn't cancel the prompt.
    if (newText && newText.trim() !== '') {
        const commentRef = ref(database, `comments/${projectId}/${commentId}`);
        // only modifies the specified fields, leaving others (like timestamp) intact.
        update(commentRef, {
            text: newText
        }).catch((error) => console.error("Update failed:", error));
    }
}

function handleCommentDelete(commentId) {
    // confirm deletion with the user.
    if (confirm("Are you sure you want to delete this comment?")) {
        const commentRef = ref(database, `comments/${projectId}/${commentId}`);
        // deletes the entire object at the specified location.
        remove(commentRef)
            .catch((error) => console.error("Delete failed:", error));
    }
}

// Creates an HTML element for a single comment.
function createCommentElement(commentId, data) {
    const div = document.createElement('div');
    div.classList.add('comment-container');
    // Store the comment's unique ID on the element itself for easy access.
    div.dataset.id = commentId;

    let buttonsHTML = '';
    // CONDITION: Only show edit/delete buttons if a user is logged in AND they are the owner.
    if (currentUser && currentUser.uid === data.uid) {
        buttonsHTML = `
            <div class="comment-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
    }

    let formattedTimestamp = '';
    // Check if the timestamp data exists before trying to format it
    if (data.timestamp) {
        // Create a new Date object from the Firebase timestamp
        const date = new Date(data.timestamp);
        // Use toLocaleString() to format the date and time
        formattedTimestamp = date.toLocaleString();
    }

    div.innerHTML = `
        <div class="comment-header">
            <p class="comment-author">${data.authorName}</p>
            <p class="comment-timestamp">${formattedTimestamp}</p>
        </div>
        <p class="comment-text">${data.text}</p>
        ${buttonsHTML}
    `;
    return div;
}

document.addEventListener("DOMContentLoaded", startApp);