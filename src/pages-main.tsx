import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Calculator } from "@/components/calculator";
import "@/styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <main className="min-h-dvh">
        <Calculator />
      </main>
    </StrictMode>,
  );
}
