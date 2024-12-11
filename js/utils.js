// Get the base URL for GitHub Pages
export const getBaseUrl = () => {
    // For GitHub Pages
    if (window.location.hostname.includes('github.io')) {
        return '/Specyf';
    }
    // For local development
    return '';
};
