// Author: tooldev.nasser@gmail.com

// Listen to browser start and launch options page to become a listener..
chrome.runtime.onStartup.addListener(function() {
    chrome.runtime.openOptionsPage();
  })

chrome.runtime.onInstalled.addListener(function() {
    chrome.runtime.openOptionsPage();
})
