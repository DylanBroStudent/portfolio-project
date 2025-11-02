// Import load component
import { loadComponent } from "/components/component-manager.js";

// wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Populate project page with content
    // footer section
    loadComponent("footer-placeholder", "/components/footer/footer.html");
});
