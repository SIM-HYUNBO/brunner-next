`use strict`;

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Layout from "@/components/layout";
import SignupContent from "./content/signupContent";

export default function Signup() {

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
        <SignupContent />
      </Layout>
    </>
  );
}
