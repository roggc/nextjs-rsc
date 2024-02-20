import { useState, useEffect } from "react";

export function usePropsChangedKey(...args) {
  const [propsChangedKey, setPropsChangedKey] = useState(0);

  useEffect(() => {
    setPropsChangedKey((k) => k + 1);
  }, [...args]);

  return propsChangedKey;
}
