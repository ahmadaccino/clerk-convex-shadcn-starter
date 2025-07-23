import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { ClerkProviderWrapper } from "./components/clerk-provider-wrapper.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ClerkProviderWrapper>
          <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ConvexProviderWithClerk>
        </ClerkProviderWrapper>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
