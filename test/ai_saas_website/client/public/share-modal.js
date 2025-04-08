// Initialize share functionality when needed
function initializeShare() {
  // Only initialize if we're on a page that needs sharing
  if (!window.location.pathname.includes('/projects')) {
    return;
  }

  // Check if share button exists before adding event listener
  const shareButton = document.querySelector('.share-button');
  
  if (shareButton) {
    shareButton.addEventListener('click', function() {
      // Share functionality
      if (navigator.share) {
        navigator.share({
          title: 'Aquariza.com',
          text: 'Check out this amazing ocean-themed platform!',
          url: window.location.href,
        })
        .catch(error => console.log('Error sharing:', error));
      } else {
        console.log('Web Share API not supported in this browser');
        // Fallback for browsers that don't support the Web Share API
        // You could show a custom modal here
      }
    });
  }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initializeShare);

// Also initialize when the route changes (for SPA navigation)
window.addEventListener('popstate', initializeShare);
