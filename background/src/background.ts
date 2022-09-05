function update(url: string) {
  chrome.tabs.query({ url: "https://www.google.com/" }, function (tabs) {
    if (tabs.length == 0) {
      chrome.tabs.create({ url: "https://www.google.com/" });
    }
  });
}
