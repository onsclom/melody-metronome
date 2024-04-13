import el from "./el.ts";
import { Store } from "./store.ts";

export default function Counter(cur: Store<number>, min: number, max: number) {
  return el(
    "div",
    { style: { display: "flex", gap: ".5rem" } },
    el("button", { onclick: () => cur.set(Math.max(cur.get() - 1, min)) }, "-"),
    el("span", {
      style: { width: "2rem", textAlign: "center" },
      onMount: (el) => {
        cur.subscribe((newVal) => {
          el.textContent = String(newVal);
        });
      },
    }),
    el("button", { onclick: () => cur.set(Math.min(cur.get() + 1, max)) }, "+"),
  );
}
