'use client'

import { useEffect, useState } from "react";

export default function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { requestAnimationFrame(step); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    const el = document.getElementById(`counter-${target}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [target]);
  return <span id={`counter-${target}`}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}