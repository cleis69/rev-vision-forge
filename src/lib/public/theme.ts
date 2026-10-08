import { useLayoutEffect } from "react";

import { brandVars } from "@/lib/brand";
import { loadBrandFont } from "@/lib/brand-fonts";

/**
 * Colour and font of the promoter on the whole document, so that the lot
 * sheet, the comparator and the dialogs (rendered at the end of <body>)
 * get them too. Removed when the page closes.
 */
export function useBrandTheme(color: string | null, font: string | null) {
  useLayoutEffect(() => {
    loadBrandFont(font);
    const vars = brandVars(color, font);
    const style = document.documentElement.style;
    for (const [name, value] of Object.entries(vars)) style.setProperty(name, value);
    return () => {
      for (const name of Object.keys(vars)) style.removeProperty(name);
    };
  }, [color, font]);
}
