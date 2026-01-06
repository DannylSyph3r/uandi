"use client";

import { useState } from "react";
import { Settings, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface GlassSettings {
  noiseScale: number;
  displacementStrength: number;
  lineFrequency: number;
  lineSharpness: number;
  animationSpeed: number;
  grainIntensity: number;
  contrastBoost: number;
  colorDark: string;
  colorMid: string;
  colorBright: string;
  colorAccent: string;
}

interface ColorPreset {
  name: string;
  colorDark: string;
  colorMid: string;
  colorBright: string;
  colorAccent: string;
}

const colorPresets: ColorPreset[] = [
  {
    name: "Pink Neon",
    colorDark: "#0a0515",
    colorMid: "#581c87",
    colorBright: "#ec4899",
    colorAccent: "#06b6d4",
  },
  {
    name: "Orange Flame",
    colorDark: "#0c0a09",
    colorMid: "#7c2d12",
    colorBright: "#f97316",
    colorAccent: "#fbbf24",
  },
  {
    name: "Blue Ocean",
    colorDark: "#020617",
    colorMid: "#1e3a8a",
    colorBright: "#3b82f6",
    colorAccent: "#67e8f9",
  },
  {
    name: "Gold Lux",
    colorDark: "#0f0c06",
    colorMid: "#78350f",
    colorBright: "#f59e0b",
    colorAccent: "#fef3c7",
  },
  {
    name: "Aurora",
    colorDark: "#022c22",
    colorMid: "#065f46",
    colorBright: "#10b981",
    colorAccent: "#a78bfa",
  },
  {
    name: "Magenta",
    colorDark: "#1a0a1a",
    colorMid: "#86198f",
    colorBright: "#d946ef",
    colorAccent: "#f0abfc",
  },
];

interface SettingsPanelProps {
  settings: GlassSettings;
  onSettingsChange: (settings: Partial<GlassSettings>) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handlePresetClick = (preset: ColorPreset) => {
    onSettingsChange({
      colorDark: preset.colorDark,
      colorMid: preset.colorMid,
      colorBright: preset.colorBright,
      colorAccent: preset.colorAccent,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-2xl"
        >
          <Settings className="h-5 w-5 text-white" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 bg-black/80 backdrop-blur-xl border-white/10 text-white shadow-2xl max-h-[85vh] overflow-y-auto">
          <CardHeader className="pb-2 flex flex-row items-center justify-between sticky top-0 bg-black/80 backdrop-blur-xl z-10">
            <CardTitle className="text-sm font-medium">Fractal Glass</CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/10"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-white/10"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isCollapsed && (
            <CardContent className="space-y-4 pt-0">
              {/* Glass Effect Parameters */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Glass Effect
                </h4>

                {/* Noise Scale */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Blob Size</Label>
                    <span className="text-white/50 font-mono">{settings.noiseScale.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.noiseScale]}
                    min={0.3}
                    max={3.0}
                    step={0.1}
                    onValueChange={([v]) => onSettingsChange({ noiseScale: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Displacement Strength */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Line Bend</Label>
                    <span className="text-white/50 font-mono">{settings.displacementStrength.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.displacementStrength]}
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    onValueChange={([v]) => onSettingsChange({ displacementStrength: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Line Frequency */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Line Density</Label>
                    <span className="text-white/50 font-mono">{settings.lineFrequency.toFixed(0)}</span>
                  </div>
                  <Slider
                    value={[settings.lineFrequency]}
                    min={40}
                    max={250}
                    step={5}
                    onValueChange={([v]) => onSettingsChange({ lineFrequency: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Line Sharpness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Line Sharpness</Label>
                    <span className="text-white/50 font-mono">{settings.lineSharpness.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.lineSharpness]}
                    min={0.1}
                    max={0.95}
                    step={0.05}
                    onValueChange={([v]) => onSettingsChange({ lineSharpness: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Contrast Boost */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Contrast</Label>
                    <span className="text-white/50 font-mono">{settings.contrastBoost.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.contrastBoost]}
                    min={0.8}
                    max={2.5}
                    step={0.1}
                    onValueChange={([v]) => onSettingsChange({ contrastBoost: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Animation Speed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Flow Speed</Label>
                    <span className="text-white/50 font-mono">{settings.animationSpeed.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[settings.animationSpeed]}
                    min={0.02}
                    max={0.3}
                    step={0.02}
                    onValueChange={([v]) => onSettingsChange({ animationSpeed: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>

                {/* Grain Intensity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <Label className="text-white/80">Film Grain</Label>
                    <span className="text-white/50 font-mono">{settings.grainIntensity.toFixed(3)}</span>
                  </div>
                  <Slider
                    value={[settings.grainIntensity]}
                    min={0}
                    max={0.12}
                    step={0.005}
                    onValueChange={([v]) => onSettingsChange({ grainIntensity: v })}
                    className="[&_[role=slider]]:bg-white"
                  />
                </div>
              </div>

              {/* Color Section */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Color Ramp (Dark → Bright)
                </h4>

                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Dark</Label>
                    <input
                      type="color"
                      value={settings.colorDark}
                      onChange={(e) => onSettingsChange({ colorDark: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-white/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Mid</Label>
                    <input
                      type="color"
                      value={settings.colorMid}
                      onChange={(e) => onSettingsChange({ colorMid: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-white/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Bright</Label>
                    <input
                      type="color"
                      value={settings.colorBright}
                      onChange={(e) => onSettingsChange({ colorBright: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-white/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-white/60">Accent</Label>
                    <input
                      type="color"
                      value={settings.colorAccent}
                      onChange={(e) => onSettingsChange({ colorAccent: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer border border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-white/60">Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs border-white/20 bg-white/5 hover:bg-white/10 text-white"
                        onClick={() => handlePresetClick(preset)}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2 shrink-0"
                          style={{
                            background: `linear-gradient(90deg, ${preset.colorDark}, ${preset.colorMid}, ${preset.colorBright}, ${preset.colorAccent})`,
                          }}
                        />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
