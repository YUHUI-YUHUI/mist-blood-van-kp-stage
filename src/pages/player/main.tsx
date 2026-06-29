import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../../styles/tokens.css";
import "../../styles/base.css";
import "../../shared/stage/stage.css";
import "./player.css";

const container = document.getElementById("root");
if (!container) throw new Error("找不到 #root 挂载点");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
