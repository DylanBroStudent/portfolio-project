// fetches HTML content and populates a specific element with it
export async function loadComponent(elementId, url) {
    try {
        // get component html
        const component = await fetch(url);
        // check if successful
        if (!component.ok) {
            console.error('Error: Failed to get component');
        }

        // get html
        const html = await component.text();
        // get placeholder
        const placeholder = document.getElementById(elementId);

        // populate the html
        if (placeholder) {
            placeholder.innerHTML = html;
        } else {
            console.error(`Error: No element with ID ${elementId} found`)
        }
    } catch (error) {
        console.error(`failed to load component from ${url}: `, error)
    }
}