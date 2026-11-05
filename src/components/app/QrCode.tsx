import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";

/* QR code of a link (Partage tab): for site boards, brochures and ads. Drawn
   here, in the browser (no outside service), and downloaded as PNG (print
   at 1 024 px) or SVG (any size). */

const OPTIONS = { errorCorrectionLevel: "M" as const, margin: 2 };

function save(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

export function QrCode({ url, fileName }: { url: string; fileName: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void QRCode.toString(url, { ...OPTIONS, type: "svg" }).then((s) => live && setSvg(s));
    return () => {
      live = false;
    };
  }, [url]);

  const png = async () =>
    save(await QRCode.toDataURL(url, { ...OPTIONS, width: 1024 }), `${fileName}.png`);
  const vector = () => {
    if (!svg) return;
    const href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    save(href, `${fileName}.svg`);
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div
        role="img"
        aria-label={`QR code du lien ${url}`}
        className="size-32 shrink-0 overflow-hidden rounded-xl bg-white p-1 [&_svg]:h-full [&_svg]:w-full"
        // The SVG comes from the qrcode library, from our own link.
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm leading-relaxed text-muted-foreground">
          À imprimer sur vos panneaux de chantier, brochures et annonces : il ouvre cette page.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-9" onClick={() => void png()}>
            <Download aria-hidden />
            PNG
          </Button>
          <Button variant="outline" className="h-9" onClick={vector} disabled={!svg}>
            <Download aria-hidden />
            SVG
          </Button>
        </div>
      </div>
    </div>
  );
}
