import type { Inputs } from "./calc";
import { DEFAULT_INPUTS } from "./calc";

export interface Preset {
  id: string;
  label: string;
  hint: string;
  inputs: Inputs;
}

export const PRESETS: Preset[] = [
  {
    id: "kawerau-t2-2ph",
    label: "Kawerau T2 · 2-ph",
    hint: "15 MVA 220/55 kV, two phases of a 3-phase set",
    inputs: { ...DEFAULT_INPUTS },
  },
  {
    id: "kawerau-t2-3ph",
    label: "Kawerau T2 · 3-ph",
    hint: "Same nameplate, balanced three-phase",
    inputs: { ...DEFAULT_INPUTS, phases: 3 },
  },
  {
    id: "original-sheet",
    label: "Original sheet",
    hint: "1-phase currents, one phase of a 3-phase set, 0% margin",
    inputs: {
      ...DEFAULT_INPUTS,
      phases: 1,
      marginPct: 0,
      hvOverride: 68,
      lvOverride: 273,
    },
  },
];
