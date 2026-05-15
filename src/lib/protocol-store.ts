import { useSyncExternalStore } from "react";

const DEFAULT_PROTOCOL = `We are inducing Type 2 diabetes in Wistar rats using STZ 95mg/kg and Nicotinamide 65mg/kg administered intraperitoneally. Rats were fasted overnight approximately 12-14 hours. STZ was dissolved in citrate buffer pH 4.5. Nicotinamide was sourced from a local Nigerian supplier. After induction we plan to treat with Metformin as the standard drug. Full cohort is 60 rats.`;

let protocol = DEFAULT_PROTOCOL;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const subscribeProtocol = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};
export const getProtocolSnapshot = () => protocol;

export function useProtocol() {
  return useSyncExternalStore(subscribeProtocol, getProtocolSnapshot, getProtocolSnapshot);
}

export function setProtocol(text: string) {
  protocol = text;
  emit();
}