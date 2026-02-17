import { useEffect, useState } from "react";

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

export const useSnap = () => {
    const [snapLoaded, setSnapLoaded] = useState(false);

    useEffect(() => {
        // Check if snap script is loaded
        const checkSnap = () => {
            if (typeof window !== "undefined" && window.snap) {
                setSnapLoaded(true);
            }
        };

        checkSnap();

        // If not loaded yet, wait a bit (handling async script load)
        const interval = setInterval(() => {
            if (typeof window !== "undefined" && window.snap) {
                setSnapLoaded(true);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const snapPay = (
        token: string,
        callbacks: {
            onSuccess?: (result: any) => void;
            onPending?: (result: any) => void;
            onError?: (result: any) => void;
            onClose?: () => void;
        }
    ) => {
        if (!snapLoaded || !window.snap) {
            console.error("Snap.js not loaded");
            return;
        }

        try {
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
        }
    };

    return { snapPay, snapLoaded };
};
