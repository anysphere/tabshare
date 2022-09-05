///<reference types="chrome"/>
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "@liveblocks/redux";

import { updateTab, addTab, removeTab, Tab, initialState } from "./store";

import "./App.css";

function WhoIsHere() {
  const othersUsersCount = useSelector(
    (state: any) => state.liveblocks.others.length
  );

  return (
    <div className="text text-slate-700">
      There are {othersUsersCount} other users online
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();

  const room =
    typeof window !== "undefined" ? window.location.pathname.slice(1) : "";

  const tabs = useSelector((state: any) => state.tabs);

  const loading = useSelector(
    (state: any) => state.liveblocks.isStorageLoading
  );

  useEffect(() => {
    if (chrome.runtime === undefined) {
      return;
    }
    const listener = (
      request: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log("request", request);
      if (request.type === "addTab") {
        dispatch(addTab(request.payload));
      } else if (request.type === "removeTab") {
        dispatch(removeTab(request.payload));
      } else if (request.type === "updateTab") {
        dispatch(updateTab(request.payload));
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    dispatch(actions.enterRoom(room, initialState));

    return () => {
      dispatch(actions.leaveRoom(room));
    };
  }, [dispatch]);

  useEffect(() => {
    if (chrome.runtime === undefined) {
      return;
    }
    console.log("update tabs", tabs);
    chrome.runtime.sendMessage({ type: "updateTabs", tabs });
  }, [JSON.stringify(tabs)]);

  return (
    <div>
      <h1 className="text-indigo-400 text-lg">Tabs.day/{room}</h1>
      {loading ? (
        <div className="text text-slate-700">Loading...</div>
      ) : (
        <WhoIsHere />
      )}
      <div className="grid">
        {tabs.map((tab: Tab) => (
          <div key={tab.id} className="text text-slate-700">
            {tab.url} (by {tab.creator})
          </div>
        ))}
      </div>
    </div>
  );
}
