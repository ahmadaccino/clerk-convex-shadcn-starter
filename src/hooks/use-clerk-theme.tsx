import { dark } from "@clerk/themes";
import { useTheme } from "./use-theme";

export function useClerkTheme() {
    const { isDark } = useTheme()


    return isDark ? dark : undefined;
}