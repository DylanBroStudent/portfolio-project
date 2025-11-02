// Import load component
import { loadComponent } from "/components/component-manager.js";

// wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Populate project page with content
    // Comment section
    loadComponent("comment-section-placeholder", "/components/comment-section/comment-section.html");
});
