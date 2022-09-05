///<reference types="chrome"/>
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "@liveblocks/redux";

import { addTab, removeTab } from "./store";

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

  useEffect(() => {
    dispatch(actions.enterRoom(room, {}));

    return () => {
      dispatch(actions.leaveRoom(room));
    };
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-indigo-400 text-lg">Liveblocks Redux Demo</h1>
      <WhoIsHere />
    </div>
  );
}
