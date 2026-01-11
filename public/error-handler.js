// Global error handler to catch "white screen" issues
window.addEventListener('error', function (event) {
  console.error('Global error:', event.error);
  var root = document.getElementById('root');
  if (root && root.innerHTML.trim() === '') {
    // If react hasn't rendered, show the error
    var errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'padding: 20px; color: white; background: #991b1b; font-family: monospace; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;';
    errorDiv.innerHTML = '<h3>Application Error</h3><pre>' + (event.error?.message || event.message || 'Unknown error') + '</pre><p>Check console for details.</p>';
    document.body.appendChild(errorDiv);
  }
});

// Check for root mount failure
setTimeout(function () {
  var root = document.getElementById('root');
  // Check if root is truly empty (no React content at all)
  // If root has any children or content, React has mounted something
  var hasContent = root && (root.children.length > 0 || root.innerHTML.trim().length > 50);

  if (!hasContent) {
    console.error('React failed to mount root component within 15 seconds');
    var errorDiv = document.createElement('div');
    errorDiv.id = 'mount-error-banner';
    errorDiv.style.cssText = 'padding: 20px; color: #333; background: #fef08a; font-family: sans-serif; position: fixed; top: 0; left: 0; right: 0; z-index: 9999; text-align: center';
    errorDiv.innerHTML = '<h3>Loading taking longer than expected...</h3><p>Please try refreshing the page.</p>';
    document.body.appendChild(errorDiv);
  }
}, 15000);

// Remove the error banner once React successfully renders content
window.addEventListener('load', function () {
  // Check periodically if React rendered and remove the banner
  var checkInterval = setInterval(function () {
    var root = document.getElementById('root');
    var banner = document.getElementById('mount-error-banner');
    if (root && root.children.length > 0 && banner) {
      banner.remove();
      clearInterval(checkInterval);
    }
  }, 1000);

  // Stop checking after 30 seconds
  setTimeout(function () {
    clearInterval(checkInterval);
  }, 30000);
});

