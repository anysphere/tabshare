import { createClient } from "@liveblocks/client";
import { enhancer } from "@liveblocks/redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";

const client = createClient({
  publicApiKey: "pk_test_6pBKexoYixbVjxlaZs6pSzLY",
});

export type Tab = {
  id: number;
  url: string;
  creator: string;
  timestamp: number;
};

export const initialState = {
  tabs: Array<Tab>(),
};

const slice = createSlice({
  name: "state",
  initialState,
  reducers: {
    addTab(state, action) {
      state.tabs.push(action.payload);
    },
    removeTab(state, action) {
      // remove the tab at index action.payload
      state.tabs.splice(action.payload, 1);
    },
    updateTab(state, action) {
      state.tabs[action.payload.index] = action.payload;
    },
  },
});

export const { addTab, removeTab, updateTab } = slice.actions;

export function makeStore() {
  return configureStore({
    reducer: slice.reducer,
    enhancers: [
      enhancer({
        client,
        storageMapping: {
          tabs: true,
        },
      }),
    ],
  });
}

const store = makeStore();

export default store;
