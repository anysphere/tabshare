///<reference types="chrome"/>
import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "@liveblocks/redux";
import { WritingBar } from "./Editor";

import {
  updateTab,
  addTab,
  moveTab,
  removeTab,
  Tab,
  initialState,
  updateText,
} from "./store";

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

const actionIds = new Set();

export default function App() {
  const dispatch = useDispatch();

  const room =
    typeof window !== "undefined" ? window.location.pathname.slice(1) : "";

  const tabs = useSelector((state: any) => state.tabs);
  const actionsState = useSelector((state: any) => state.actions);

  const text = useSelector((state: any) => state.text);

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
      // if actionIds has the id, then we already have it
      if (actionIds.has(request.payload.actionId)) {
        return;
      }
      actionIds.add(request.payload.actionId);
      if (request.payload.type === "ADD") {
        dispatch(addTab(request.payload));
      } else if (request.payload.type === "REMOVE") {
        dispatch(removeTab(request.payload));
      } else if (request.payload.type === "UPDATE") {
        dispatch(updateTab(request.payload));
      } else if (request.payload.type === "MOVE") {
        dispatch(moveTab(request.payload));
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  const [firstTime, setFirstTime] = React.useState(true);
  useEffect(() => {
    // set the time to false in 200ms
    if (firstTime) {
      setTimeout(() => {
        setFirstTime(false);
      }, 200);
    }
  }, [firstTime]);

  const enterRoom = useCallback(() => {
    dispatch(
      actions.enterRoom(room, {
        tabs,
        actions: actionsState,
        text,
        cursor: {
          x: 0,
          y: 0,
        },
      })
    );
  }, [firstTime]);

  useEffect(() => {
    console.log("USE EFFECT IS CALLED YAYAYAYAY");
    if (!firstTime) {
      enterRoom();
    }

    return () => {
      dispatch(actions.leaveRoom(room));
    };
  }, [enterRoom]);

  useEffect(() => {
    if (chrome.runtime === undefined) {
      return;
    }
    console.log("update tabs", tabs, actions);
    chrome.runtime.sendMessage({
      type: "updateTabs",
      tabs,
      actions: actionsState,
    });
  }, [JSON.stringify(tabs), JSON.stringify(actionsState)]);

  return (
    <div className="p-4">
      <h1 className="text-indigo-400 text-lg">Tabs.day/{room}</h1>
      {loading ? (
        <div className="text text-slate-700">Loading...</div>
      ) : (
        <>
          <WhoIsHere />
          <div className="bg-slate-100 rounded-lg">
            <WritingBar
              onUpdate={(s: string) => {
                dispatch(updateText(s));
              }}
              content={text}
            />
          </div>
        </>
      )}
      <div className="w-full h-px bg-black my-4 mx-1"></div>
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
