import { createClient } from "@liveblocks/client";
import { enhancer } from "@liveblocks/redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";

const client = createClient({
  publicApiKey: "pk_test_6pBKexoYixbVjxlaZs6pSzLY",
});

export type Tab = {
  id: string;
  url: string;
  creator: string;
  timestamp: number;
};

export type Action = {
  type: "ADD" | "UPDATE" | "REMOVE" | "MOVE";
  index: number; // Only for ADD and MOVE
  url: string; // Only for ADD and UPDATE
  id: string;
  by: string;
  actionId: string;
};

export const initialState = {
  tabs: Array<Tab>(),
  actions: Array<Action>(),
  text: "",
  cursor: {
    x: 0,
    y: 0,
  },
};

const slice = createSlice({
  name: "state",
  initialState,
  reducers: {
    // action.payload contains: { url: string, index: number, id: string } (id is random)
    // if index is too big, add to the end
    addTab(state, action) {
      // insert the tab at the given index
      const tab = {
        id: action.payload.id,
        url: action.payload.url,
        creator: action.payload.by,
        timestamp: Date.now(),
      };
      state.tabs.splice(action.payload.index, 0, tab);
      state.actions.push(action.payload);
    },
    // action.payload contains: { id: number }
    // no-op if id is not found
    removeTab(state, action) {
      // remove the tab with the given id
      const index = state.tabs.findIndex((tab) => tab.id === action.payload.id);
      state.actions.push(action.payload);
      if (index !== -1) {
        state.tabs.splice(index, 1);
      }
    },
    // action.payload contains: { url: string, id: number }
    // no-op if id is not found
    updateTab(state, action) {
      // update the tab with the given id
      const index = state.tabs.findIndex((tab) => tab.id === action.payload.id);
      state.actions.push(action.payload);
      if (index !== -1) {
        state.tabs[index].url = action.payload.url;
      }
    },
    // action.payload contains: { id: number, toIndex: number }
    // no-op if id is not found
    moveTab(state, action) {
      // move the tab with the given id
      const index = state.tabs.findIndex((tab) => tab.id === action.payload.id);
      state.actions.push(action.payload);
      if (index !== -1) {
        const tab = state.tabs[index];
        state.tabs.splice(index, 1);
        state.tabs.splice(action.payload.index, 0, tab);
      }
    },
    updateText(state, action) {
      state.text = action.payload;
    },
  },
});

export const { addTab, removeTab, updateTab, updateText, moveTab } =
  slice.actions;

export function makeStore() {
  return configureStore({
    reducer: slice.reducer,
    enhancers: [
      enhancer({
        client,
        storageMapping: {
          tabs: true,
          actions: true,
          text: true,
        },
        // presenceMapping: {
        //   cursor: true,
        // },
      }),
    ],
  });
}

const store = makeStore();

// const others = useSelector((state: any) => state.liveblocks.others);
// const

export default store;
