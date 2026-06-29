// popup.js
document.getElementById('launchApp').addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("login.html")
  });
  window.close(); // Close popup anchor after execution
});