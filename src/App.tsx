///<reference types="chrome"/>
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions } from "@liveblocks/redux";
import { WritingSection } from "./Components/Editor";
import { fakeTabs, fakeText } from "./fake";
import { Header } from "./Components/Header";
import { TabsList } from "./Components/TabsList";
import backgroundImage from "./Images/background.jpg";
import { Container } from "./Components/Container";

import {
  updateTab,
  addTab,
  removeTab,
  Tab,
  initialState,
  updateText,
} from "./store";

import "./App.css";

function Statistics({ statisticsMap }: { statisticsMap: [string, string][] }) {
  return (
    <dl className="mt-10 grid grid-cols-1 gap-y-6 gap-x-10 sm:mt-16 sm:gap-y-10 sm:gap-x-16 sm:text-center lg:auto-cols-auto lg:grid-flow-col lg:grid-cols-none lg:justify-start lg:text-left">
      {statisticsMap.map(([name, value]) => (
        <div key={name}>
          <dt className="font-mono text-sm text-blue-600">{name}</dt>
          <dd className="mt-0.5 text-2xl font-semibold tracking-tight text-blue-900">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SectionTitle({
  title,
  isShared,
}: {
  title: string;
  isShared: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl lg:mx-0">
      <h2 className="font-display text-2xl font-medium tracking-tighter text-blue-600 sm:text-3xl">
        {title}
      </h2>
      {isShared && <p className="text-base text-blue-800">Shared</p>}
    </div>
  );
}

export function MainAttention({ room }: { room: string }) {
  const othersUsersCount = useSelector(
    (state: any) => state.liveblocks.others.length
  );

  const statisticsMap: [string, string][] = [
    ["Number of people tabs.daying", othersUsersCount + 1],
  ];

  return (
    <div className="relative sm:pt-4 sm:mb-2">
      <div className="absolute inset-x-0 -top-48 -bottom-14 overflow-hidden bg-indigo-50 ">
        <img
          className="absolute top-0 left-0 translate-y-[-10%] translate-x-[-55%] -scale-x-100 sm:left-1/2 sm:translate-y-[-6%] sm:translate-x-[-98%] lg:translate-x-[-106%] xl:translate-x-[-122%]"
          src={backgroundImage}
          alt=""
          width={918}
          height={1495}
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white" />
      </div>
      <Container className="relative ">
        <div className="mx-auto max-w-2xl lg:max-w-4xl lg:px-12">
          <div className="font-display mx-auto text-center text-xl tracking-tighter text-blue-600 sm:text-3xl">
            Tab Room: <span className="font-bold">{room}</span>
          </div>
        </div>
        <Statistics statisticsMap={statisticsMap} />
      </Container>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();

  const room =
    typeof window !== "undefined" ? window.location.pathname.slice(1) : "";

  let tabs = useSelector((state: any) => state.tabs);
  let text = useSelector((state: any) => state.text);
  const actionsState = useSelector((state: any) => state.actions);

  if (import.meta.env.DEV) {
    tabs = fakeTabs;
    text = fakeText;
  }

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
    console.log("update tabs", tabs, actions);
    chrome.runtime.sendMessage({
      type: "updateTabs",
      tabs,
      actions: actionsState,
    });
  }, [JSON.stringify(tabs), JSON.stringify(actionsState)]);

  return (
    <>
      <Header />
      <main>
        <MainAttention room={room} />

        {loading && <div className="text text-slate-700">Loading...</div>}

        <div className="w-full h-2 py-4 bg-white"></div>
        <Container>
          <div className="w-full h-px bg-teal-700 my-4 mx-auto"></div>
          <div className="grid grid-cols-5">
            <SectionTitle title="Editor" isShared={true} />
            <div className="col-span-4">
              <WritingSection
                onUpdate={(s: string) => {
                  dispatch(updateText(s));
                }}
                content={text}
              />
            </div>
          </div>
        </Container>

        <Container>
          <div className="w-full h-px bg-teal-700 my-4 mx-auto"></div>
          <div className="grid grid-cols-5">
            <SectionTitle title="Tabs" isShared={true} />
            <div className="col-span-4">
              <TabsList tabs={tabs} />
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
