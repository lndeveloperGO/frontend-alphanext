import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PackageItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  type: 'bundle' | 'single';
  // For bundles
  packages?: Array<{
    id: string;
    name: string;
    description?: string;
    pivot: {
      sort_order: number;
    };
  }>;
  // For single packages
  package?: {
    id: string;
    name: string;
    description?: string;
    price: number;
  };
}

interface CheckoutState {
  selectedPackage: PackageItem | null;
  setSelectedPackage: (pkg: PackageItem | null) => void;
  clearSelection: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selectedPackage: null,
      setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
      clearSelection: () => set({ selectedPackage: null }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
