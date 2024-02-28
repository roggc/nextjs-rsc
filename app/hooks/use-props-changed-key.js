import { useState, useEffect, useRef } from "react";

export function usePropsChangedKey(...args) {
  const [propsChangedKey, setPropsChangedKey] = useState(0);
  const isFirstRenderRef = useRef(false);

  useEffect(() => {
    isFirstRenderRef.current = true;
  }, []);

  useEffect(() => {
    if (!isFirstRenderRef.current) {
      setPropsChangedKey((k) => k + 1);
    } else {
      isFirstRenderRef.current = false;
    }
  }, [...args]);

  return propsChangedKey;
}
