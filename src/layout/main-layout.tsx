import { SidebarInset } from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export function MainLayout({
    children,
    pageTitle,
}: {
    children: React.ReactNode;
    pageTitle: string;
}) {
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
                <SiteHeader pageTitle={pageTitle} />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}