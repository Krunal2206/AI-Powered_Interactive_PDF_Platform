"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export function useMobileMenu(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggle = useCallback(() => setIsOpen((open) => !open), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return { isOpen, setIsOpen, toggle, close, open };
}

