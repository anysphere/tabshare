import { current } from "@reduxjs/toolkit";

import { InternalTab, Tab, Action } from "./tabs";

function randomIdentifier() {
  return Math.random().toString(36).substring(7);
}

class TabManager {
  private tabs: Array<InternalTab>;
  private actions: Array<Action>;
  private sentIndex: number;

  public constructor() {
    this.tabs = Array<InternalTab>(); // these tabs store the chrome tabId, our tab id, and the url
    this.actions = Array<Action>();
    this.sentIndex = -1;
    // TODO: get current tabs and initialize this.tabs
    chrome.tabs.query({ currentWindow: true }).then((tabs) => {
      for (const tab of tabs) {
        this.create(tab);
      }
    });
  }

  public async remoteUpdate(
    tabs: Array<Tab>,
    actions: Array<Action>,
    windowId: number
  ) {
    // TODO: if actions is empty, then send Add events for all of our tabs here

    console.log("remoteUpdate", tabs, actions, windowId);

    // find the first index of disagreement of actions and this.actions
    // let i = 0;
    // for (; i < actions.length && this.actions.length; i++) {
    //   if (actions[i] !== this.actions[i]) {
    //     break;
    //   }
    // }
    // // if the first index of disagreement is after all remote actions, return early (no update needed)
    // if (i >= actions.length) {
    //   return;
    // }

    // // if the first index of disagreement is within our local actions, we just reboot
    // if (i < this.actions.length) {
    //   this.reboot(tabs, actions, windowId);
    //   return;
    // }

    // // otherwise, we simply apply the remote actions to our local tabs
    // // they *should* just work
    // for (; i < actions.length; i++) {
    //   const action: Action = actions[i]!;
    //   this.actions.push(action);
    //   switch (action.type) {
    //     case "ADD":
    //       // add the tab in chrome
    //       const tab = await chrome.tabs.create({
    //         url: action.url,
    //         windowId,
    //         index: action.index,
    //       });
    //       this.tabs.splice(action.index, 0, {
    //         tabId: tab.id ?? -1,
    //         id: action.id,
    //         url: action.url,
    //       });
    //       break;
    //     case "UPDATE":
    //       // update the tab in chrome
    //       // find the tab in this.tabs with the same id as actions[i].id
    //       let index = this.tabs.findIndex((tab) => tab.id === action.id);
    //       // no-op if the tab doesn't exist
    //       if (index < 0 || index >= this.tabs.length) {
    //         break;
    //       }
    //       // update the tab in chrome
    //       await chrome.tabs.update(this.tabs[index]!.tabId, {
    //         url: action.url,
    //       });
    //       // update the tab in this.tabs
    //       this.tabs[index]!.url = action.url;
    //       break;
    //     case "MOVE":
    //       {
    //         // move the tab in chrome
    //         // find the tab in this.tabs with the same id as actions[i].id
    //         const index = this.tabs.findIndex((tab) => tab.id === action.id);
    //         // no-op if the tab doesn't exist
    //         if (index < 0 || index >= this.tabs.length) {
    //           break;
    //         }
    //         // move the tab in chrome
    //         await chrome.tabs.move(this.tabs[index]!.tabId, {
    //           index: action.index,
    //         });
    //         // move the tab in this.tabs
    //         this.tabs.splice(action.index, 0, this.tabs.splice(index, 1)[0]!);
    //       }
    //       break;
    //     case "REMOVE":
    //       {
    //         // remove the tab in chrome
    //         // find the tab in this.tabs with the same id as actions[i].id
    //         const index = this.tabs.findIndex((tab) => tab.id === action.id);
    //         // no-op if the tab doesn't exist
    //         if (index < 0 || index >= this.tabs.length) {
    //           break;
    //         }
    //         // remove the tab in chrome
    //         await chrome.tabs.remove(this.tabs[index]!.tabId);
    //         // remove the tab in this.tabs
    //         this.tabs.splice(index, 1);
    //       }
    //       break;
    //   }
    // }
  }

  public async reboot(
    tabs: Array<Tab>,
    actions: Array<Action>,
    windowId: number
  ) {
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

  public async sendRemote(windowId: number) {
    // iterate over each action in this.actions from sentIndex + 1 to the end
    // send each action to the server
    const currentTabs = await chrome.tabs.query({ windowId });
    console.log("currentTabs", currentTabs);
    let tabsTab = currentTabs.find((tab) => tab.url?.includes("tabs.day"));
    // if there is no tabsTab, the tabsTab is probablyy a chrome://newtab/ tab
    if (!tabsTab) {
      return;
    }
    if (!tabsTab.id) {
      return;
    }
    for (let i = this.sentIndex + 1; i < this.actions.length; i++) {
      const action = this.actions[i];
      // if (!tabsTab) {
      //   tabsTab = currentTabs.find((tab) =>
      //     tab.url?.includes("chrome://newtab")
      //   );
      // }
      // // last resort: just use the first tab
      // if (!tabsTab) {
      //   tabsTab = currentTabs[0];
      // }
      console.log("action", action);
      console.log("to tabsTab", tabsTab);
      chrome.tabs.sendMessage(
        tabsTab.id,
        {
          payload: action,
        },
        (response) => {
          if (response) {
            console.log("response", response);
          } else {
            console.log("no response. error??");
          }
        }
      );
    }
    this.sentIndex = this.actions.length - 1;
  }

  public async create(tab: chrome.tabs.Tab) {
    const action: Action = {
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
    this.sendRemote(tab.windowId);
  }

  public async remove(tabId: number) {
    // find the tab in this.tabs with the same tabId as tabId
    const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
    // if the tab doesn't exist, no-op
    if (index < 0 || index >= this.tabs.length) {
      return;
    }
    const action: Action = {
      type: "REMOVE",
      index: -1,
      url: "",
      id: this.tabs[index]!.id,
      by: "me",
    };
    this.actions.push(action);
    this.tabs.splice(index, 1);
    this.sendRemote(chrome.windows.WINDOW_ID_CURRENT);
  }

  public async update(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) {
    // find the tab in this.tabs with the same tabId as tabId
    const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
    // if the tab doesn't exist, no-op
    if (index < 0 || index >= this.tabs.length) {
      return;
    }
    const action: Action = {
      type: "UPDATE",
      index: -1,
      url: tab?.url ?? "",
      id: this.tabs[index]!.id,
      by: "me",
    };
    this.actions.push(action);
    this.tabs[index]!.url = tab.url ?? "";
    this.sendRemote(tab.windowId);
  }

  public async move(tabId: number, moveInfo: chrome.tabs.TabMoveInfo) {
    // find the tab in this.tabs with the same tabId as tabId
    const index = this.tabs.findIndex((tab) => tab.tabId === tabId);
    // if the tab doesn't exist, no-op
    if (index < 0 || index >= this.tabs.length) {
      return;
    }
    const action: Action = {
      type: "MOVE",
      index: moveInfo.toIndex,
      url: "",
      id: this.tabs[index]!.id,
      by: "me",
    };
    this.actions.push(action);
    this.tabs.splice(moveInfo.toIndex, 0, this.tabs.splice(index, 1)[0]!);
    this.sendRemote(chrome.windows.WINDOW_ID_CURRENT);
  }
}

const tabManager = new TabManager();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateTabs") {
    tabManager.remoteUpdate(
      message.tabs,
      message.actions,
      sender.tab?.windowId ?? chrome.windows.WINDOW_ID_CURRENT
    );
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
