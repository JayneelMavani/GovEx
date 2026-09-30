"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect } from "react";

function ScrollbarAutoHide() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      document.documentElement.classList.add("is-scrolling");
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 1200);
    };

    // Show initially for 1.2s then fade out
    handleScroll();

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      if (timer) clearTimeout(timer);
    };
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ScrollbarAutoHide />
      {children}
    </SessionProvider>
  );
}
