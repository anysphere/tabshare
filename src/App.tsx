///<reference types="chrome"/>
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "@liveblocks/redux";

import "./App.css";

function WhoIsHere() {
  const othersUsersCount = useSelector(
    (state) => state.liveblocks.others.length
  );

  return (
    <div className="who_is_here">
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
    <div className="container">
      <h1>Liveblocks Redux Demo</h1>
      <WhoIsHere />
    </div>
  );
}
