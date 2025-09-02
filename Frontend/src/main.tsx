import React from "react";
import ReactDom from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";

ReactDom.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
    <Toaster position="bottom-right" reverseOrder={false} />
  </React.StrictMode>
);
