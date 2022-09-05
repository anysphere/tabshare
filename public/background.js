"use strict";
// Function: update
// Description: check the state of tabs in chrome.
//              create a new tab if there is no tab with the url.
function update(url) {
    chrome.tabs.query({ url: "https://www.google.com/" }, function (tabs) {
        if (tabs.length == 0) {
            chrome.tabs.create({ url: "https://www.google.com/" });
        }
    });
}
