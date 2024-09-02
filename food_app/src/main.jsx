import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import GlobelState from "./context/index.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <GlobelState>
        <App />
      </GlobelState>
    </StrictMode>
  </BrowserRouter>
);
