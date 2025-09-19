// hooks/useInitTheme.js
import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function useInitTheme(): void {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme) setTheme(theme);
  }, [theme, setTheme]);
}
