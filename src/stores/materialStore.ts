import { create } from 'zustand';
import { materialService, Material, MaterialPart, CreateMaterialInput, UpdateMaterialInput, CreateMaterialPartInput, UpdateMaterialPartInput } from '@/lib/materialService';

interface MaterialState {
  // Materials
  materials: Material[];
  isLoadingMaterials: boolean;
  isCreatingMaterial: boolean;
  isUpdatingMaterial: boolean;
  isDeletingMaterial: boolean;

  // Parts
  parts: MaterialPart[];
  isLoadingParts: boolean;
  isCreatingPart: boolean;
  isUpdatingPart: boolean;
  isDeletingPart: boolean;
  isReorderingParts: boolean;

  // Error
  error: string | null;

  // Actions
  loadMaterials: (params?: any) => Promise<void>;
  createMaterial: (input: CreateMaterialInput) => Promise<Material | null>;
  updateMaterial: (id: string, input: UpdateMaterialInput) => Promise<Material | null>;
  deleteMaterial: (id: string) => Promise<void>;
  loadParts: (materialId: string) => Promise<void>;
  createPart: (materialId: string, input: CreateMaterialPartInput) => Promise<MaterialPart | null>;
  updatePart: (materialId: string, partId: string, input: UpdateMaterialPartInput) => Promise<MaterialPart | null>;
  deletePart: (materialId: string, partId: string) => Promise<void>;
  reorderParts: (materialId: string, parts: { id: string; sort_order: number }[]) => Promise<void>;
  clearError: () => void;
}

export const useMaterialStore = create<MaterialState>((set, get) => ({
  // Initial state
  materials: [],
  isLoadingMaterials: false,
  isCreatingMaterial: false,
  isUpdatingMaterial: false,
  isDeletingMaterial: false,

  parts: [],
  isLoadingParts: false,
  isCreatingPart: false,
  isUpdatingPart: false,
  isDeletingPart: false,
  isReorderingParts: false,

  error: null,

  // Actions
  loadMaterials: async (params) => {
    set({ isLoadingMaterials: true, error: null });
    try {
      const response = await materialService.getAdminMaterials(params);
      set({ materials: response.data || [], isLoadingMaterials: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load materials',
        isLoadingMaterials: false
      });
    }
  },

  createMaterial: async (input) => {
    set({ isCreatingMaterial: true, error: null });
    try {
      const material = await materialService.createMaterial(input);
      set((state) => ({
        materials: [...state.materials, material],
        isCreatingMaterial: false
      }));
      return material;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create material',
        isCreatingMaterial: false
      });
      return null;
    }
  },

  updateMaterial: async (id, input) => {
    set({ isUpdatingMaterial: true, error: null });
    try {
      const material = await materialService.updateMaterial(id, input);
      set((state) => ({
        materials: state.materials.map(m => m.id.toString() === id ? material : m),
        isUpdatingMaterial: false
      }));
      return material;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update material',
        isUpdatingMaterial: false
      });
      return null;
    }
  },

  deleteMaterial: async (id) => {
    set({ isDeletingMaterial: true, error: null });
    try {
      await materialService.deleteMaterial(id);
      set((state) => ({
        materials: state.materials.filter(m => m.id.toString() !== id),
        isDeletingMaterial: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete material',
        isDeletingMaterial: false
      });
    }
  },

  loadParts: async (materialId) => {
    set({ isLoadingParts: true, error: null });
    try {
      const response = await materialService.getMaterialParts(materialId);
      set({ parts: response || [], isLoadingParts: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load parts',
        isLoadingParts: false
      });
    }
  },

  createPart: async (materialId, input) => {
    set({ isCreatingPart: true, error: null });
    try {
      const part = await materialService.createMaterialPart(materialId, input);
      set((state) => ({
        parts: [...state.parts, part],
        isCreatingPart: false
      }));
      return part;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create part',
        isCreatingPart: false
      });
      return null;
    }
  },

  updatePart: async (materialId, partId, input) => {
    set({ isUpdatingPart: true, error: null });
    try {
      const part = await materialService.updateMaterialPart(materialId, partId, input);
      set((state) => ({
        parts: state.parts.map(p => p.id.toString() === partId ? part : p),
        isUpdatingPart: false
      }));
      return part;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update part',
        isUpdatingPart: false
      });
      return null;
    }
  },

  deletePart: async (materialId, partId) => {
    set({ isDeletingPart: true, error: null });
    try {
      await materialService.deleteMaterialPart(materialId, partId);
      set((state) => ({
        parts: state.parts.filter(p => p.id.toString() !== partId),
        isDeletingPart: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete part',
        isDeletingPart: false
      });
    }
  },

  reorderParts: async (materialId, parts) => {
    set({ isReorderingParts: true, error: null });
    try {
      await materialService.reorderMaterialParts(materialId, parts);
      // Update local parts with new sort orders
      set((state) => ({
        parts: state.parts.map(p => {
          const updated = parts.find(up => up.id === p.id.toString());
          return updated ? { ...p, sort_order: updated.sort_order } : p;
        }),
        isReorderingParts: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to reorder parts',
        isReorderingParts: false
      });
    }
  },

  clearError: () => set({ error: null }),
}));
