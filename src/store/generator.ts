import { create } from "zustand";

interface StoredData {
  config: any;
  output: any;
}

interface GeneratorStore {
  configs: Record<string, any>;
  data: Record<string, StoredData>;
  setCurrentConfig: (game: string, config: any) => void;
  getCurrentConfig: (game: string) => any;
  setGeneratedData: (game: string, config: any, output: any) => void;
  getGeneratedData: (game: string) => StoredData | null;
  clearGeneratedData: (game: string) => void;
}

export const useGeneratorStore = create<GeneratorStore>((set, get) => ({
  configs: {},
  data: {},
  setCurrentConfig: (game, config) =>
    set((state) => ({ configs: { ...state.configs, [game]: config } })),
  getCurrentConfig: (game) => get().configs[game],
  setGeneratedData: (game, config, output) =>
    set((state) => ({
      data: { ...state.data, [game]: { config, output } },
      configs: { ...state.configs, [game]: config },
    })),
  getGeneratedData: (game) => get().data[game] ?? null,
  clearGeneratedData: (game) =>
    set((state) => {
      const next = { ...state.data };
      delete next[game];
      return { data: next };
    }),
}));
