// force things to happen upon setting
export default function GetterSetter<T>(
  initVal: T,
  onChange: (val: T) => void = () => {},
) {
  let cur = initVal;
  const setCur = (val: T) => {
    cur = val;
    onChange(val);
  };
  return [() => cur, setCur] as const;
}
