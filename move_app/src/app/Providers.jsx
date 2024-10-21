"use client";
import React from "react";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }) {
  return (
    <ThemeProvider defaultTheme="system" attribute="class">
      <div className=" transition-colors duration-300 dark:text-gray-200 select-none">
        {children}
      </div>
    </ThemeProvider>
  );
}
