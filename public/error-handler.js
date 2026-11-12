// This classic script works even when a stale module prevents React from mounting.
(function () {
  function hasRenderedContent() {
    var root = document.getElementById('root');
    return !!root && Array.from(root.children).some(function (child) {
      return !['NOSCRIPT', 'SCRIPT', 'STYLE'].includes(child.tagName);
    });
  }
  function showFailure(message) {
    if (hasRenderedContent() || document.getElementById('mount-error-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'mount-error-banner';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'padding:20px;color:#333;background:#fef08a;font-family:sans-serif;position:fixed;top:0;left:0;right:0;z-index:9999;text-align:center';
    var heading = document.createElement('h3');
    heading.textContent = 'The app could not finish loading';
    var description = document.createElement('p');
    description.textContent = message || 'Please reload to get the latest version.';
    var reload = document.createElement('button');
    reload.textContent = 'Reload page';
    reload.onclick = function () { window.location.reload(); };
    banner.append(heading, description, reload);
    document.body.appendChild(banner);
  }
  window.addEventListener('error', function (event) {
    if (event.error) showFailure(event.error.message || 'Please reload the page.');
  });
  setTimeout(function () { showFailure(); }, 15000);
  var root = document.getElementById('root');
  if (root) {
    var observer = new MutationObserver(function () {
      if (!hasRenderedContent()) return;
      var banner = document.getElementById('mount-error-banner');
      if (banner) banner.remove();
      observer.disconnect();
    });
    observer.observe(root, { childList: true });
  }
})();
