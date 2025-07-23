import { SidebarInset } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export function MainLayout({
  children,
  pageTitle,
  pageDescription,
}: {
  children: React.ReactNode;
  pageTitle: string;
  pageDescription?: string;
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SignIn />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader pageTitle={pageTitle} pageDescription={pageDescription} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
