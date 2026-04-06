"use client";
import { useMemo, useState } from "react";

export function usePdfViewer() {
  const [scale, setScale] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [fitMode, setFitMode] = useState<"fitH" | "zoom">("fitH");

  const MIN_ZOOM = 0.6, MAX_ZOOM = 2, STEP = 0.1;

  const actions = useMemo(() => ({
    zoomIn: () => { setFitMode("zoom"); setScale(s => Math.min(MAX_ZOOM, +(s + STEP).toFixed(2))); },
    zoomOut: () => { setFitMode("zoom"); setScale(s => Math.max(MIN_ZOOM, +(s - STEP).toFixed(2))); },
    resetFit: () => { setFitMode("fitH"); setScale(1); },
    enterFs: () => setFullscreen(true),
    exitFs: () => setFullscreen(false),
  }), []);

  return { scale, fitMode, fullscreen, ...actions };
}
