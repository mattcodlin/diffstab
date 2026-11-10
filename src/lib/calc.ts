export type Phases = 1 | 2 | 3;

export interface Inputs {
  name: string;
  phases: Phases;
  ratingMva: number;
  hvKv: number;
  lvKv: number;
  percentZ: number;
  hvCt: number;
  lvCt: number;
  hvOverride: number | null;
  lvOverride: number | null;
  vInj: number;
  marginPct: number;
}

export interface DirectionResult {
  zvVolts: number;
  injectedA: number;
  farSideA: number;
  injCtMa: number;
  farCtMa: number;
  outputKva: number;
  generatorKva: number;
}

export interface Results {
  k: number;
  kGen: number;
  hvRatedA: number;
  lvRatedA: number;
  hvUsedA: number;
  lvUsedA: number;
  hvInject: DirectionResult;
  lvInject: DirectionResult;
  governingKva: number;
  governingOutKva: number;
  governingDir: "lv" | "hv";
}

export const DEFAULT_INPUTS: Inputs = {
  name: "Kawerau T2",
  phases: 2,
  ratingMva: 15,
  hvKv: 220,
  lvKv: 55,
  percentZ: 17.71,
  hvCt: 400,
  lvCt: 300,
  hvOverride: null,
  lvOverride: null,
  vInj: 400,
  marginPct: 10,
};

export function phaseFactor(phases: Phases): number {
  if (phases === 1) return 1;
  if (phases === 2) return 2;
  return Math.sqrt(3);
}

/** Nameplate factor for a 3-phase generator.
 *  1- or 2-phase transformer: one or two phases loaded, S = 3 × V × I.
 *  3-phase transformer: all phases loaded, S = √3 × V × I.
 */
export function genFactor(phases: Phases): number {
  return phases === 3 ? Math.sqrt(3) : 3;
}

function finite(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function compute(i: Inputs): Results {
  const k = phaseFactor(i.phases);
  const kGen = genFactor(i.phases);
  const hvRatedA = finite((i.ratingMva * 1000) / (k * i.hvKv));
  const lvRatedA = finite((i.ratingMva * 1000) / (k * i.lvKv));
  const hvUsedA =
    i.hvOverride != null && Number.isFinite(i.hvOverride)
      ? i.hvOverride
      : hvRatedA;
  const lvUsedA =
    i.lvOverride != null && Number.isFinite(i.lvOverride)
      ? i.lvOverride
      : lvRatedA;

  const zvHv = finite((i.percentZ / 100) * i.hvKv * 1000);
  const zvLv = finite((i.percentZ / 100) * i.lvKv * 1000);

  const hvInjA = zvHv === 0 ? 0 : finite((hvUsedA * i.vInj) / zvHv);
  const lvScFromHv = zvHv === 0 ? 0 : finite((lvUsedA * i.vInj) / zvHv);
  const lvInjA = zvLv === 0 ? 0 : finite((lvUsedA * i.vInj) / zvLv);
  const hvScFromLv = zvLv === 0 ? 0 : finite((hvUsedA * i.vInj) / zvLv);

  const hvCtMa = i.hvCt === 0 ? 0 : finite((hvInjA / i.hvCt) * 1000);
  const lvCtFromHv = i.lvCt === 0 ? 0 : finite((lvScFromHv / i.lvCt) * 1000);
  const lvCtMa = i.lvCt === 0 ? 0 : finite((lvInjA / i.lvCt) * 1000);
  const hvCtFromLv = i.hvCt === 0 ? 0 : finite((hvScFromLv / i.hvCt) * 1000);

  const margin = 1 + (Number.isFinite(i.marginPct) ? i.marginPct : 0) / 100;

  const hvOut = finite((k * i.vInj * hvInjA) / 1000);
  const hvGen = finite((kGen * i.vInj * hvInjA * margin) / 1000);
  const lvOut = finite((k * i.vInj * lvInjA) / 1000);
  const lvGen = finite((kGen * i.vInj * lvInjA * margin) / 1000);

  const governingDir: "lv" | "hv" = lvGen >= hvGen ? "lv" : "hv";
  const governingKva = Math.max(hvGen, lvGen);
  const governingOutKva = governingDir === "lv" ? lvOut : hvOut;

  return {
    k,
    kGen,
    hvRatedA,
    lvRatedA,
    hvUsedA,
    lvUsedA,
    hvInject: {
      zvVolts: zvHv,
      injectedA: hvInjA,
      farSideA: lvScFromHv,
      injCtMa: hvCtMa,
      farCtMa: lvCtFromHv,
      outputKva: hvOut,
      generatorKva: hvGen,
    },
    lvInject: {
      zvVolts: zvLv,
      injectedA: lvInjA,
      farSideA: hvScFromLv,
      injCtMa: lvCtMa,
      farCtMa: hvCtFromLv,
      outputKva: lvOut,
      generatorKva: lvGen,
    },
    governingKva,
    governingOutKva,
    governingDir,
  };
}

export function fmt(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && abs < 0.001) return n.toExponential(2);
  return n.toFixed(digits);
}

export function fmtInt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Math.round(n).toLocaleString("en-NZ");
}

export function kLabel(phases: Phases): string {
  if (phases === 1) return "1";
  if (phases === 2) return "2";
  return "√3";
}

export function kGenLabel(phases: Phases): string {
  return phases === 3 ? "√3" : "3";
}

export function phasesUsedLabel(phases: Phases): string {
  if (phases === 1) return "1 phase of a 3-phase set";
  if (phases === 2) return "2 phases of a 3-phase set";
  return "3 phases of a 3-phase set";
}

export function summaryText(i: Inputs, r: Results): string {
  const dir =
    r.governingDir === "lv" ? "LV inject / HV short" : "HV inject / LV short";
  return [
    `DiffStab — ${i.name || "unnamed transformer"}`,
    `${i.phases}-phase  ·  ${fmt(i.ratingMva, 2)} MVA  ·  ${fmt(i.hvKv, 2)} / ${fmt(i.lvKv, 2)} kV  ·  ${fmt(i.percentZ, 2)} %Z`,
    `k = ${kLabel(i.phases)}  ·  ${phasesUsedLabel(i.phases)}  ·  V ${fmtInt(i.vInj)} V  ·  margin ${fmt(i.marginPct, 1)}%`,
    `Rated I  HV ${fmt(r.hvRatedA)} A  ·  LV ${fmt(r.lvRatedA)} A`,
    `HV inject: I_HV ${fmt(r.hvInject.injectedA)} A  ·  I_LV ${fmt(r.hvInject.farSideA)} A  ·  gen ${fmt(r.hvInject.generatorKva, 2)} kVA`,
    `LV inject: I_LV ${fmt(r.lvInject.injectedA)} A  ·  I_HV ${fmt(r.lvInject.farSideA)} A  ·  gen ${fmt(r.lvInject.generatorKva, 2)} kVA`,
    `Governing: ${fmt(r.governingKva, 2)} kVA  (${dir})`,
    `CT secondaries (LV inject): LV ${fmt(r.lvInject.injCtMa)} mA  ·  HV ${fmt(r.lvInject.farCtMa)} mA`,
  ].join("\n");
}
