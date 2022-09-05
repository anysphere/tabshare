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
      state.tabs = state.tabs.filter((tab) => tab.id !== action.payload);
    },
    updateTab(state, action) {
      const index = state.tabs.findIndex((tab) => tab.id === action.payload.id);
      state.tabs[index] = action.payload;
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
