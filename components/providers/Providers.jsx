"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import SmoothScroll from "./SmoothScroll";

export default function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </ThemeProvider>
  );
}
