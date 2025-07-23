import {
  IconDotsVertical
} from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useClerkTheme } from "@/hooks/use-clerk-theme";
import { UserButton, useUser } from "@clerk/clerk-react";

export function NavUser() {
  const { user } = useUser()
  const clerkTheme = useClerkTheme();

  function handleClick() {
    const el = document.getElementsByClassName('cl-userButtonTrigger')
    if (el.length > 0) {
      (el[0] as HTMLButtonElement).click()
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>

        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          onClick={handleClick}
        >
          <UserButton appearance={{ baseTheme: clerkTheme }} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.fullName}</span>
            <span className="text-muted-foreground truncate text-xs">
              {user?.emailAddresses[0].emailAddress}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
