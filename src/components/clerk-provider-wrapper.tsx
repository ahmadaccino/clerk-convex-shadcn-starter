import { useClerkTheme } from "@/hooks/use-clerk-theme.tsx";
import { ClerkProvider } from "@clerk/clerk-react";

export function ClerkProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkTheme = useClerkTheme();

  const publishableKey: string = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{ baseTheme: clerkTheme }}
    >
      {children}
    </ClerkProvider>
  );
}
