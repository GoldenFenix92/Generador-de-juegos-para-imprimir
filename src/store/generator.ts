import { create } from "zustand";

interface GeneratorStore {
  configs: Record<string, any>;
  setCurrentConfig: (game: string, config: any) => void;
  getCurrentConfig: (game: string) => any;
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  configs: {},
  setCurrentConfig: (game, config) =>
    set((state) => ({ configs: { ...state.configs, [game]: config } })),
  getCurrentConfig: (game) => get().configs[game],
}));
