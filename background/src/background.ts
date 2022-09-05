import { current } from "@reduxjs/toolkit";
import { assert } from "console";
import { Tab } from "./tabs";

function longestCommonSubsequence(
  a: string[],
  b: string[],
  compare: (a: string, b: string) => boolean = (a, b) => a === b
): [number[], number[]] {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // return the index in a
  let i = m;
  let j = n;
  const res_a = [];
  const res_b = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      res_a.push(i - 1);
      res_b.push(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return [res_a.reverse(), res_b.reverse()];
}

async function update(tabs: Tab[], windowID: number): void {
  // get the tab list from the chrome
  const currentTabs = await chrome.tabs.query({ windowId: windowID });

  const localTabStrings = tabs.map((tab) => tab.url);
  const currentTabStrings = currentTabs.map((tab) => tab.url ?? "-1");

  const [localTabIndices, currentTabIndices] = longestCommonSubsequence(
    localTabStrings,
    currentTabStrings
  );

  currentTabs.forEach((tab, i) => {
    if (currentTabIndices.includes(i)) {
      return;
    } else {
      if (tab.id) chrome.tabs.remove(tab.id);
    }
  });

  tabs.forEach((tab, i) => {
    if (localTabIndices.includes(i)) {
      return;
    } else {
      // create it at the right index
      chrome.tabs.create({ url: tab.url, windowId: windowID, index: i });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateTabs") {
    update(
      message.tabs,
      sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT
    );
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  chrome.runtime.sendMessage({
    type: "addTab",
    tab: {
      id: tab.id,
      url: tab.url ?? "-1",
      creator: "chrome",
      timestamp: Date.now(),
    },
  });
});

chrome.tabs.onRemoved.addListener((tabID) => {
  chrome.runtime.sendMessage({
    type: "removeTab",
    tabID,
  });
});

chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
  if (changeInfo.url) {
    chrome.runtime.sendMessage({
      type: "updateTab",
      tab: {
        id: tab.id,
        url: tab.url ?? "-1",
        creator: "chrome",
        timestamp: Date.now(),
      },
    });
  }
});
