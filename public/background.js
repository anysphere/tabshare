"use strict";

function longestCommonSubsequence(a, b, compare = (a, b) => a === b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (compare(a[i - 1], b[j - 1])) {
                if (dp[i - 1] === undefined)
                    return [[], []];
                if (dp[i] === undefined)
                    return [[], []];
                dp[i][j] = dp[i - 1][j - 1] + 1;
            }
            else {
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
        }
        else if (dp[i - 1][j] > dp[i][j - 1]) {
            i--;
        }
        else {
            j--;
        }
    }
    return [res_a.reverse(), res_b.reverse()];
}
// store the time of the last update
let lastUpdate = 0;
let lastUpdate2 = 0;
async function update(tabs, windowID) {
    if (Date.now() - lastUpdate2 < 100)
        return;
    // get the tab list from the chrome
    const currentTabs = await chrome.tabs.query({ windowId: windowID });
    const localTabStrings = tabs.map((tab) => tab.url);
    const currentTabStrings = currentTabs.map((tab) => tab.url ?? "-1");
    // find the tabsTab index in currentTabs
    let tabsTabIndex = currentTabs.findIndex((tab) => tab.url?.includes("tabs.day"));
    const [localTabIndices, currentTabIndices] = longestCommonSubsequence(localTabStrings, currentTabStrings);
    lastUpdate = Date.now();
    currentTabs.forEach((tab, i) => {
        if (currentTabIndices.includes(i) ||
            tab.url?.includes("https://tabs.day")) {
            return;
        }
        else {
            if (tab.id)
                chrome.tabs.remove(tab.id);
            if (i < tabsTabIndex)
                tabsTabIndex--;
        }
    });
    tabs.forEach((tab, i) => {
        if (localTabIndices.includes(i)) {
            return;
        }
        else {
            // create it at the right index
            chrome.tabs.create({
                url: tab.url,
                windowId: windowID,
                index: i < tabsTabIndex ? tabsTabIndex + 1 : tabsTabIndex,
            });
            if (i < tabsTabIndex)
                tabsTabIndex++;
        }
    });
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateTabs") {
        update(message.tabs, sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT);
    }
});
chrome.tabs.onCreated.addListener(async (tab) => {
    // if last update is recent, don't do anything
    if (Date.now() - lastUpdate < 100)
        return;
    const currentTabs = await chrome.tabs.query({ windowId: tab.windowId });
    // find the tab that has url containing tabs.day
    const tabsTab = currentTabs.find((tab) => tab.url?.includes("tabs.day"));
    chrome.tabs.sendMessage(tabsTab?.id ?? -1, {
        type: "addTab",
        payload: {
            id: tab.id,
            url: tab.url ?? "-1",
            creator: "chrome",
            timestamp: Date.now(),
        },
    });
});
chrome.tabs.onRemoved.addListener(async (tabID) => {
    // chrome.runtime.sendMessage({
    //   type: "removeTab",
    //   tabID,
    // });
    if (Date.now() - lastUpdate < 100)
        return;
    const currentTabs = await chrome.tabs.query({ currentWindow: true });
    // find the tab that has url containing tabs.day
    const tabsTab = currentTabs.find((tab) => tab.url?.includes("tabs.day"));
    // get the index after filtering out the tabsTab
    const removeTabIndex = currentTabs
        .filter((tab) => !tab.url?.includes("tabs.day"))
        .find((tab) => tab.id === tabID)?.index;
    chrome.tabs.sendMessage(tabsTab?.id ?? -1, {
        type: "removeTab",
        payload: removeTabIndex,
    });
});
chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
    if (Date.now() - lastUpdate < 100)
        return;
    const currentTabs = await chrome.tabs.query({ windowId: tab.windowId });
    // find the tab that has url containing tabs.day
    const tabsTab = currentTabs.find((tab) => tab.url?.includes("tabs.day"));
    lastUpdate2 = Date.now();
    if (changeInfo.url) {
        chrome.tabs.sendMessage(tabsTab?.id ?? -1, {
            type: "updateTab",
            payload: {
                index: tab.index < tabsTab?.index ? tab.index : tab.index - 1,
                url: changeInfo.url ?? "-1",
            },
        });
    }
});
