import { IconDotsVertical } from "@tabler/icons-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useClerkTheme } from "@/hooks/use-clerk-theme";
import { useTheme } from "@/hooks/use-theme";
import { UserButton, useUser } from "@clerk/clerk-react";
import { MoonIcon, SunIcon } from "lucide-react";

export function NavUser() {
  const { user } = useUser();
  const clerkTheme = useClerkTheme();
  const { theme, setTheme } = useTheme();

  function handleClick() {
    const el = document.getElementsByClassName("cl-userButtonTrigger");
    if (el.length > 0) {
      (el[0] as HTMLButtonElement).click();
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
          <div className="relative w-full h-full pl-0.5 pt-0.5 md:pt-0 md:pl-0 md:w-auto md:h-auto">
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="absolute top-0 left-0 w-full h-full z-10"
            ></div>
            <UserButton appearance={{ baseTheme: clerkTheme }}>
              <UserButton.MenuItems>
                <UserButton.Action
                  label={
                    theme === "dark"
                      ? "Turn On Light Mode"
                      : "Turn On Dark Mode"
                  }
                  labelIcon={
                    theme === "dark" ? (
                      <SunIcon className="h-4 -ml-1" />
                    ) : (
                      <MoonIcon className="h-4 -ml-1" />
                    )
                  }
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              </UserButton.MenuItems>
            </UserButton>
          </div>
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
