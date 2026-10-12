import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { legacyHashToPath } from "./routing.js";

const legacyPath = legacyHashToPath(window.location.hash);
if (legacyPath) window.history.replaceState(null, "", legacyPath);

// Replace prerendered markup rather than hydrating against client-only theme state.
createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
