import * as React from "react";
import { Tab } from "../store";
import { clsx, ClassValue } from "clsx";
import { taskCancelled } from "@reduxjs/toolkit/dist/listenerMiddleware/exceptions";

export function TabsList({
  tabs,
  className,
}: {
  tabs: Tab[];
  className?: ClassValue;
}) {
  // return (
  //   <div className="grid">
  //     {tabs.map((tab: Tab) => (
  //       <div key={tab.id} className="text text-slate-700">
  //         {tab.url} (by {tab.creator})
  //       </div>
  //     ))}
  //   </div>
  // );

  return (
    <>
      {/* <div className="grid grid-cols-3">
        add titles maybe???
      </div> */}
      <ol
        role="list"
        className={clsx(
          className,
          "space-y-2 bg-white/60 py-2 px-10 text-center shadow-xl shadow-blue-900/5 backdrop-blur"
        )}
      >
        {tabs.map((tab, index) => {
          let timestamp = new Date(tab.timestamp);

          return (
            <li key={tab.id}>
              {index > 0 && (
                <div className="mx-auto mb-1 h-px w-48 bg-indigo-500/10" />
              )}
              <div className="grid grid-cols-3">
                <h4 className="text-left text-lg tracking-tight text-blue-900">
                  {tab.url}
                </h4>
                <span className="mt-1 font-thin text-sm tracking-tight text-blue-900">
                  {tab.creator}
                </span>
                <span className="mt-1 font-mono text-xs text-slate-500">
                  {timestamp.toLocaleString()}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
