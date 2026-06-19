"use client";

import { motion } from "framer-motion";
import { useEffect, useState, Children } from "react";
import type { ReactNode } from "react";

/**
 * Staggers the homepage sections in on load.
 * To avoid hydration mismatch, we render plain (no motion) on the server
 * and first client paint, then enable the animation after mount.
 */
export default function HomeReveal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  
  const items = Children.toArray(children);

  // Before mount: render children plainly so server & client HTML match.
  if (!mounted) {
    return <div>{items}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}