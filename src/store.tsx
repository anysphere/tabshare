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
    addTab(state, action) {
      const tab = action.payload.tab;
      const index = action.payload.index;
      state.tabs.splice(index, 0, tab);
    },
    removeTab(state, action) {
      // remove the tab at index action.payload
      state.tabs.splice(action.payload, 1);
    },
    updateTab(state, action) {
      state.tabs[action.payload.index].url = action.payload.url;
    },
    updateText(state, action) {
      state.text = action.payload;
    },
  },
});

export const { addTab, removeTab, updateTab, updateText } = slice.actions;

export function makeStore() {
  return configureStore({
    reducer: slice.reducer,
    enhancers: [
      enhancer({
        client,
        storageMapping: {
          tabs: true,
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
