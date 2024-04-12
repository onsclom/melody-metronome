import el from "./el.ts";
import GetterSetter from "./getter-setter.ts";

export default function Counter(
  initVal: number,
  onChange: (val: number) => void = () => {},
  min: number,
  max: number,
) {
  const [cur, setCur] = GetterSetter(initVal, (val) => {
    decButton.disabled = val === min;
    incButton.disabled = val === max;
    countText.textContent = String(val);
    onChange(val);
  });

  const countText = el(
    "span",
    { style: { width: "2rem", textAlign: "center" } },
    String(initVal),
  );
  const decButton = el("button", { onclick: () => setCur(cur() - 1) }, "-");
  const incButton = el("button", { onclick: () => setCur(cur() + 1) }, "+");

  return el(
    "div",
    { style: { display: "flex", gap: ".5rem" } },
    decButton,
    countText,
    incButton,
  );
}
