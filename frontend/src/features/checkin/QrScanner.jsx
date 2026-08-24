import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

export default function QrScanner({ onScan, active }) {
  const containerId = "qr-scanner-box";
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const scanner = new Html5Qrcode(containerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          if (!cancelled) {
            cancelled = true;
            onScan(decodedText);
          }
        },
        () => {},
      )
      .catch(() => {
        if (!cancelled) {
          onScan(
            null,
            "Não foi possível acessar a câmera. Use a digitação manual.",
          );
        }
      });

    return () => {
      cancelled = true;
      const currentScanner = scannerRef.current;
      if (currentScanner) {
        const cleanup =
          currentScanner.getState() === Html5QrcodeScannerState.SCANNING
            ? currentScanner.stop()
            : Promise.resolve();

        cleanup.catch(() => {}).finally(() => currentScanner.clear());
      }
    };
  }, [active]);

  if (!active) return null;

  return <div id={containerId} className="qr-scanner-box" />;
}
