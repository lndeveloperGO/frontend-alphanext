import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const SNAP_SCRIPT_URL_SANDBOX = "https://app.sandbox.midtrans.com/snap/snap.js";
const SNAP_SCRIPT_URL_PRODUCTION = "https://app.midtrans.com/snap/snap.js";

export const useSnap = () => {
  const [snapLoaded, setSnapLoaded] = useState(false);

  const loadSnap = useCallback((clientKey: string, isProduction: boolean) => {
    return new Promise<void>((resolve, reject) => {
      if (window.snap) {
        setSnapLoaded(true);
        resolve();
        return;
      }

      const scriptId = "midtrans-snap-script";
      const existingScript = document.getElementById(scriptId);
      
      if (existingScript) {
        existingScript.remove();
      }

      const scriptUrl = isProduction ? SNAP_SCRIPT_URL_PRODUCTION : SNAP_SCRIPT_URL_SANDBOX;
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;

      script.onload = () => {
        setSnapLoaded(true);
        resolve();
      };

      script.onerror = () => {
        reject(new Error("Gagal memuat script pembayaran Midtrans"));
      };

      document.head.appendChild(script);
    });
  }, []);

  const snapPay = useCallback(async (
    token: string,
    config: { clientKey: string; isProduction: boolean },
    callbacks: {
      onSuccess?: (result: any) => void;
      onPending?: (result: any) => void;
      onError?: (result: any) => void;
      onClose?: () => void;
    }
  ) => {
    try {
      await loadSnap(config.clientKey, config.isProduction);

      if (!window.snap) {
        throw new Error("Snap.js tidak tersedia");
      }

      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log("Success", result);
          callbacks.onSuccess?.(result);
        },
        onPending: (result: any) => {
          console.log("Pending", result);
          callbacks.onPending?.(result);
        },
        onError: (result: any) => {
          console.error("Error", result);
          callbacks.onError?.(result);
        },
        onClose: () => {
          console.log("Customer closed the popup without finishing the payment");
          callbacks.onClose?.();
        },
      });
    } catch (err) {
      console.error("Failed to trigger snap pay", err);
      callbacks.onError?.(err);
    }
  }, [loadSnap]);

  return { snapPay, snapLoaded };
};
