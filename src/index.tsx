import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { Provider } from "react-redux";
import store from "./store";

const body = document.querySelector("body");

const app = document.createElement("div");

app.id = "react-root";

// Make sure the element that you want to mount the app to has loaded. You can
// also use `append` or insert the app using another method:
// https://developer.mozilla.org/en-US/docs/Web/API/Element#methods
//
// Also control when the content script is injected from the manifest.json:
// https://developer.chrome.com/docs/extensions/mv3/content_scripts/#run_time
if (body) {
  body.prepend(app);
}

const placeholder = document.getElementById("placeholder");
if (placeholder) {
  placeholder.style.display = "none";
}

const container = document.getElementById("react-root");
const root = createRoot(container!);

if (window.location.pathname !== "/" || import.meta.env.DEV) {
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}
