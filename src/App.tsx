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

  useEffect(() => {
    dispatch(
      actions.enterRoom("redux-demo-room", {
        todos: [],
      })
    );

    return () => {
      dispatch(actions.leaveRoom("redux-demo-room"));
    };
  }, [dispatch]);

  return (
    <div>
      <h1 className="text-indigo-400 text-lg">Liveblocks Redux Demo</h1>
      <WhoIsHere />
    </div>
  );
}
