"use strict";
// THIS IS A GENERATED FILE. DO NOT EDIT.
function randomIdentifier() {
    return Math.random().toString(36).substring(7);
}
class TabManager {
    constructor() {
        this.tabs = Array(); // these tabs store the chrome tabId, our tab id, and the url
        this.actions = Array();
        // TODO: get current tabs and initialize this.tabs
    }
    async remoteUpdate(tabs, actions, windowId) {
        // TODO: if actions is empty, then send Add events for all of our tabs here
        // find the first index of disagreement of actions and this.actions
        let i = 0;
        for (; i < actions.length && this.actions.length; i++) {
            if (actions[i] !== this.actions[i]) {
                break;
            }
        }
        // if the first index of disagreement is after all remote actions, return early (no update needed)
        if (i >= actions.length) {
            return;
        }
        // if the first index of disagreement is within our local actions, we just reboot
        if (i < this.actions.length) {
            this.reboot(tabs, actions, windowId);
            return;
        }
        // otherwise, we simply apply the remote actions to our local tabs
        // they *should* just work
        for (; i < actions.length; i++) {
            const action = actions[i];
            this.actions.push(action);
            switch (action.type) {
                case "ADD":
                    // add the tab in chrome
                    const tab = await chrome.tabs.create({
                        url: action.url,
                        windowId,
                        index: action.index,
                    });
                    this.tabs.splice(action.index, 0, {
                        tabId: tab.id ?? -1,
                        id: action.id,
                        url: action.url,
                    });
                    break;
                case "UPDATE":
                    // update the tab in chrome
                    // find the tab in this.tabs with the same id as actions[i].id
                    let index = this.tabs.findIndex((tab) => tab.id === action.id);
                    // no-op if the tab doesn't exist
                    if (index < 0 || index >= this.tabs.length) {
                        break;
                    }
                    // update the tab in chrome
                    await chrome.tabs.update(this.tabs[index].tabId, {
                        url: action.url,
                    });
                    // update the tab in this.tabs
                    this.tabs[index].url = action.url;
                    break;
                case "MOVE":
                    {
                        // move the tab in chrome
                        // find the tab in this.tabs with the same id as actions[i].id
                        const index = this.tabs.findIndex((tab) => tab.id === action.id);
                        // no-op if the tab doesn't exist
                        if (index < 0 || index >= this.tabs.length) {
                            break;
                        }
                        // move the tab in chrome
                        await chrome.tabs.move(this.tabs[index].tabId, {
                            index: action.index,
                        });
                        // move the tab in this.tabs
                        this.tabs.splice(action.index, 0, this.tabs.splice(index, 1)[0]);
                    }
                    break;
                case "REMOVE":
                    {
                        // remove the tab in chrome
                        // find the tab in this.tabs with the same id as actions[i].id
                        const index = this.tabs.findIndex((tab) => tab.id === action.id);
                        // no-op if the tab doesn't exist
                        if (index < 0 || index >= this.tabs.length) {
                            break;
                        }
                        // remove the tab in chrome
                        await chrome.tabs.remove(this.tabs[index].tabId);
                        // remove the tab in this.tabs
                        this.tabs.splice(index, 1);
                    }
                    break;
            }
        }
    }
    async reboot(tabs, actions, windowId) {
        this.actions = actions;
        // just delete all tabs and re-add them
        // except the tabs.day tab
        const currentTabs = await chrome.tabs.query({ windowId });
        // for each tab, delete it if it's not the tabs.day tab
        for (const tab of currentTabs) {
            //   if (tab.url.includes("tabs.day")) {
            //     continue;
            //   }
            if (tab.id) {
                await chrome.tabs.remove(tab.id);
            }
        }
        // now add all of the tabs
        for (const tab of tabs) {
            const newTab = await chrome.tabs.create({
                url: tab.url,
                windowId,
            });
            this.tabs.push({
                tabId: newTab.id ?? -1,
                id: tab.id,
                url: tab.url,
            });
        }
    }
    async sendRemote(action, windowId) {
        const currentTabs = await chrome.tabs.query({ windowId });
        const tabsTab = currentTabs.find((tab) => tab.url?.includes("tabs.day"));
        chrome.tabs.sendMessage(tabsTab?.id ?? -1, {
            payload: action,
        });
    }
    async create(tab) {
        const action = {
            type: "ADD",
            index: tab.index,
            url: tab?.url ?? "",
            id: randomIdentifier(),
            by: "me",
        };
        this.actions.push(action);
        this.tabs.splice(tab.index, 0, {
            tabId: tab?.id ?? -1,
            id: action.id,
            url: action.url,
        });
        this.sendRemote(action, tab.windowId);
    }
    async remove(tabId) {
        // find the tab in this.tabs with the same tabId as tabId
        const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
        // if the tab doesn't exist, no-op
        if (index < 0 || index >= this.tabs.length) {
            return;
        }
        const action = {
            type: "REMOVE",
            index: -1,
            url: "",
            id: this.tabs[index].id,
            by: "me",
        };
        this.actions.push(action);
        this.tabs.splice(index, 1);
        this.sendRemote(action, chrome.windows.WINDOW_ID_CURRENT);
    }
    async update(tabId, changeInfo, tab) {
        // find the tab in this.tabs with the same tabId as tabId
        const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
        // if the tab doesn't exist, no-op
        if (index < 0 || index >= this.tabs.length) {
            return;
        }
        const action = {
            type: "UPDATE",
            index: -1,
            url: tab?.url ?? "",
            id: this.tabs[index].id,
            by: "me",
        };
        this.actions.push(action);
        this.tabs[index].url = tab.url ?? "";
        this.sendRemote(action, tab.windowId);
    }
    async move(tabId, moveInfo) {
        // find the tab in this.tabs with the same tabId as tabId
        const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
        // if the tab doesn't exist, no-op
        if (index < 0 || index >= this.tabs.length) {
            return;
        }
        const action = {
            type: "MOVE",
            index: moveInfo.toIndex,
            url: "",
            id: this.tabs[index].id,
            by: "me",
        };
        this.actions.push(action);
        this.tabs.splice(moveInfo.toIndex, 0, this.tabs.splice(index, 1)[0]);
        this.sendRemote(action, chrome.windows.WINDOW_ID_CURRENT);
    }
}
let tabManager = new TabManager();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateTabs") {
        tabManager.remoteUpdate(message.tabs, message.actions, sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT);
    }
});
chrome.tabs.onCreated.addListener(async (tab) => {
    tabManager.create(tab);
});
chrome.tabs.onRemoved.addListener(async (tabId) => {
    tabManager.remove(tabId);
});
chrome.tabs.onUpdated.addListener(async (tabID, changeInfo, tab) => {
    tabManager.update(tabID, changeInfo, tab);
});
chrome.tabs.onMoved.addListener(async (tabId, moveInfo) => {
    tabManager.move(tabId, moveInfo);
});
