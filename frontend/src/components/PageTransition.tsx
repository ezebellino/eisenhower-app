import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export default function PageTransition({ children }: PropsWithChildren) {
  return (
    <motion.div
      className="route-screen"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.div>
  );
}
