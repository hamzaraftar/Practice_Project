import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import {ProductContextPorvider} from "./context/ProductContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ProductContextPorvider>
        <App />
      </ProductContextPorvider>
    </BrowserRouter>
  </StrictMode>
);
