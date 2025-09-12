`use strict`;

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/layout";
import SigninContent from "./content/signinContent";
import { useTheme } from "next-themes";

export default function Signin() {
  useEffect(() => {
      setThemeRef(themeRef.current);
  }, []);

  const { theme, setTheme } = useTheme();
  const themeRef = useRef(theme);

  const setThemeRef = (newValue) => {
    themeRef.current = newValue;
    setTheme(newValue);
  };

  return (
    <>
      <Layout>
        <SigninContent />
      </Layout>
    </>
  );
}
