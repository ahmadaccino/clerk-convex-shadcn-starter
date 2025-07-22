import { createContext, useContext } from "react";
import { useMediaQuery } from "./use-media-query";

export type Theme = "dark" | "light" | "system";

export type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

export const ThemeProviderContext =
    createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    const perfersDark = useMediaQuery('(prefers-color-scheme: dark)')

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return {
        ...context,
        isDark: context.theme === 'dark' || (context.theme === 'system' && perfersDark)
    };
};
