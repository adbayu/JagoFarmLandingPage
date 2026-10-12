import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { legacyHashToPath } from "./routing.js";

const legacyPath = legacyHashToPath(window.location.hash);
if (legacyPath) window.history.replaceState(null, "", legacyPath);

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
