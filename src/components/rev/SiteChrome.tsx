import type { ReactNode } from "react";

import { Footer } from "./FinalCta";
import { Header } from "./Header";

/** Header and footer of the showcase site (not used by the /app space). */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
