"use client";

import { useState } from "react";
import { FractalGlassBackground } from "@/components/FractalGlassBackground";
import { SettingsPanel, GlassSettings } from "@/components/SettingsPanel";

const defaultSettings: GlassSettings = {
  noiseScale: 1.0,
  displacementStrength: 0.15,
  lineFrequency: 120,
  lineSharpness: 0.5,
  animationSpeed: 0.1,
  grainIntensity: 0.04,
  contrastBoost: 1.3,
  colorDark: "#0a0515",
  colorMid: "#581c87",
  colorBright: "#ec4899",
  colorAccent: "#06b6d4",
};

export default function FractalGlassPage() {
  const [settings, setSettings] = useState<GlassSettings>(defaultSettings);

  const handleSettingsChange = (newSettings: Partial<GlassSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <main className="relative min-h-screen bg-black">
      <FractalGlassBackground
        noiseScale={settings.noiseScale}
        displacementStrength={settings.displacementStrength}
        lineFrequency={settings.lineFrequency}
        lineSharpness={settings.lineSharpness}
        animationSpeed={settings.animationSpeed}
        grainIntensity={settings.grainIntensity}
        contrastBoost={settings.contrastBoost}
        gradientColors={[
          settings.colorDark,
          settings.colorMid,
          settings.colorBright,
          settings.colorAccent,
        ]}
      />
      <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} />
    </main>
  );
}
