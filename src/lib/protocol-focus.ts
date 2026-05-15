import { useSyncExternalStore } from "react";

let focusedLine: number | null = null;
let token = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

export function focusProtocolLine(line: number) {
  focusedLine = line;
  token++;
  listeners.forEach((l) => l());
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    focusedLine = null;
    listeners.forEach((l) => l());
  }, 2400);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
// token forces re-render even if line is the same
const getSnapshot = () => `${focusedLine ?? "_"}:${token}`;
const getServerSnapshot = () => "_:0";

export function useFocusedLine(): number | null {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return focusedLine;
}
