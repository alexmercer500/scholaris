import { Profiler, StrictMode, type ProfilerOnRenderCallback } from "react";
import { createRoot } from "react-dom/client";
import { AppProviders } from "@app/providers/AppProviders";
import App from "./App";
import "./index.css";

async function enableMocking() {
  const { worker } = await import("@mocks/browser");
  return worker.start({ onUnhandledRequest: "bypass" });
}

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
  if (import.meta.env.DEV && actualDuration > 16) {
    console.warn(`[slow render] ${id} (${phase}) ${actualDuration.toFixed(1)}ms`);
  }
};


enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <AppProviders>
        <Profiler id="root" onRender={onRender}>
          <App />
        </Profiler>
      </AppProviders>
    </StrictMode>,
  );
});
