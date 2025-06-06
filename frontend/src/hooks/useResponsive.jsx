import { useEffect, useState } from "react";
import isBrowser from "../utils/isBrowser";

const subscribers = new Set();
let info;
let responsiveConfig = {
  xs: 0,
  sm: 576,
  isMobile: false,
  md: 768,
  lg: 992,
  xl: 1200,
};

function handleResize() {
  const oldInfo = info;
  calculate();
  if (oldInfo !== info) return;
  for (const subscriber of subscribers) {
    subscriber();
  }
}
let listening = false;
function calculate() {
  const width = window.innerWidth;
  const newInfo = {};
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig)) {
    newInfo[key] = width >= responsiveConfig[key];
    if (newInfo[key] != info[key]) {
      shouldUpdate = true;
    }
  }
  if (shouldUpdate) {
    info = newInfo;
  }
}

export default function useResponsive() {
  if (isBrowser && !listening) {
    info = {};
    calculate();
    window.addEventListener("resize", handleResize);
    listening = true;
  }

  const [state, setState] = useState(info);

  useEffect(() => {
    if (!isBrowser) return;

    if (!listening) {
      window.addEventListener("resize", handleResize);
    }

    const subscriber = () => {
      setState(info);
    };
    subscribers.add(subscriber);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        window.removeEventListener("resize", handleResize);
        listening = false;
      }
    };
  }, []);
  return { screenSize: state, isMobile: !state.md };
}
