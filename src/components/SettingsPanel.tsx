"use client";

import { useState } from "react";
import { Settings, X, SlidersHorizontal } from "lucide-react";

export interface GlassSettings {
  noiseScale: number;
  displacementStrength: number;
  lineFrequency: number;
  ridgeWaviness: number;
  animationSpeed: number;
  grainIntensity: number;
  contrastBoost: number;
  waveComplexity: number;
  flowIntensity: number;
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
    name: "Neon",
    colorDark: "#0a0515",
    colorMid: "#581c87",
    colorBright: "#ec4899",
    colorAccent: "#06b6d4",
  },
  {
    name: "Flame",
    colorDark: "#0c0a09",
    colorMid: "#7c2d12",
    colorBright: "#f97316",
    colorAccent: "#fbbf24",
  },
  {
    name: "Ocean",
    colorDark: "#020617",
    colorMid: "#1e3a8a",
    colorBright: "#3b82f6",
    colorAccent: "#67e8f9",
  },
  {
    name: "Gold",
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
    name: "Violet",
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

// Custom minimal slider component
function MinimalSlider({
  value,
  min,
  max,
  step,
  onChange,
  accent = "white",
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  accent?: string;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative h-6 flex items-center group">
      <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/[0.08]">
        <div
          className="absolute h-full rounded-full transition-all duration-100"
          style={{
            width: `${percentage}%`,
            background: accent === "white" 
              ? "linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.6))"
              : `linear-gradient(90deg, ${accent}66, ${accent})`,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
      <div
        className="absolute w-3 h-3 rounded-full bg-white shadow-lg shadow-black/30 transition-all duration-100
                   ring-2 ring-white/20 group-hover:ring-white/40 group-hover:scale-110"
        style={{ left: `calc(${percentage}% - 6px)` }}
      />
    </div>
  );
}

// Minimal control row
function ControlRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (v: number) => string;
  accent?: string;
}) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(2);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-white/50 font-medium tracking-wide">{label}</span>
        <span className="text-[10px] text-white/30 font-mono tabular-nums">{displayValue}</span>
      </div>
      <MinimalSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        accent={accent}
      />
    </div>
  );
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"flow" | "glass" | "color">("flow");

  const handlePresetClick = (preset: ColorPreset) => {
    onSettingsChange({
      colorDark: preset.colorDark,
      colorMid: preset.colorMid,
      colorBright: preset.colorBright,
      colorAccent: preset.colorAccent,
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative h-12 w-12 rounded-2xl 
                     bg-white/10 backdrop-blur-xl border border-white/20
                     hover:bg-white/15 hover:border-white/30
                     transition-all duration-300 ease-out
                     shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.05)]
                     hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_30px_rgba(255,255,255,0.1)]"
        >
          <Settings className="h-5 w-5 text-white/80 mx-auto group-hover:text-white 
                               transition-all duration-300 group-hover:rotate-45" />
        </button>
      )}

      {/* Settings panel */}
      {isOpen && (
        <div className="w-72 rounded-2xl overflow-hidden
                        bg-black/40 backdrop-blur-2xl 
                        border border-white/[0.06]
                        shadow-[0_24px_80px_rgba(0,0,0,0.5)]
                        animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs font-medium text-white/70 tracking-wide">Settings</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 rounded-lg flex items-center justify-center
                         hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X className="h-3.5 w-3.5 text-white/40" />
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 p-2 border-b border-white/[0.04]">
            {(["flow", "glass", "color"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSection(tab)}
                className={`flex-1 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest rounded-lg
                           transition-all duration-200 ${
                             activeSection === tab
                               ? "bg-white/[0.08] text-white/80"
                               : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                           }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            
            {/* Flow Section */}
            {activeSection === "flow" && (
              <div className="space-y-5">
                <ControlRow
                  label="Wave Complexity"
                  value={settings.waveComplexity}
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  onChange={(v) => onSettingsChange({ waveComplexity: v })}
                />
                <ControlRow
                  label="Flow Warp"
                  value={settings.flowIntensity}
                  min={0}
                  max={2.0}
                  step={0.1}
                  onChange={(v) => onSettingsChange({ flowIntensity: v })}
                />
                <ControlRow
                  label="Pattern Scale"
                  value={settings.noiseScale}
                  min={0.3}
                  max={2.0}
                  step={0.1}
                  onChange={(v) => onSettingsChange({ noiseScale: v })}
                />
                <ControlRow
                  label="Flow Speed"
                  value={settings.animationSpeed}
                  min={0.02}
                  max={0.3}
                  step={0.02}
                  onChange={(v) => onSettingsChange({ animationSpeed: v })}
                />
                <ControlRow
                  label="Dark Valleys"
                  value={settings.contrastBoost}
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  onChange={(v) => onSettingsChange({ contrastBoost: v })}
                />
              </div>
            )}

            {/* Glass Section */}
            {activeSection === "glass" && (
              <div className="space-y-5">
                <ControlRow
                  label="Ridge Depth"
                  value={settings.displacementStrength}
                  min={0.02}
                  max={0.4}
                  step={0.01}
                  onChange={(v) => onSettingsChange({ displacementStrength: v })}
                />
                <ControlRow
                  label="Ridge Count"
                  value={settings.lineFrequency}
                  min={20}
                  max={200}
                  step={5}
                  onChange={(v) => onSettingsChange({ lineFrequency: v })}
                  formatValue={(v) => v.toFixed(0)}
                />
                <ControlRow
                  label="Ridge Waviness"
                  value={settings.ridgeWaviness}
                  min={0}
                  max={1.5}
                  step={0.05}
                  onChange={(v) => onSettingsChange({ ridgeWaviness: v })}
                />
                <ControlRow
                  label="Film Grain"
                  value={settings.grainIntensity}
                  min={0}
                  max={0.12}
                  step={0.005}
                  onChange={(v) => onSettingsChange({ grainIntensity: v })}
                  formatValue={(v) => v.toFixed(3)}
                />
              </div>
            )}

            {/* Color Section */}
            {activeSection === "color" && (
              <div className="space-y-5">
                {/* Gradient preview */}
                <div className="h-8 rounded-xl overflow-hidden ring-1 ring-white/[0.06]"
                     style={{
                       background: `linear-gradient(90deg, ${settings.colorDark}, ${settings.colorMid}, ${settings.colorBright}, ${settings.colorAccent})`,
                     }}
                />

                {/* Color pickers */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { key: "colorDark", label: "Dark", value: settings.colorDark },
                    { key: "colorMid", label: "Mid", value: settings.colorMid },
                    { key: "colorBright", label: "Bright", value: settings.colorBright },
                    { key: "colorAccent", label: "Accent", value: settings.colorAccent },
                  ].map(({ key, label, value }) => (
                    <div key={key} className="space-y-1.5">
                      <span className="text-[9px] text-white/30 uppercase tracking-wider block text-center">
                        {label}
                      </span>
                      <label className="relative block aspect-square rounded-xl cursor-pointer
                                        ring-1 ring-white/[0.08] hover:ring-white/[0.15]
                                        transition-all duration-200 hover:scale-105
                                        overflow-hidden">
                        <div className="absolute inset-0" style={{ background: value }} />
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => onSettingsChange({ [key]: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                  ))}
                </div>

                {/* Presets */}
                <div className="pt-2">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider block mb-3">
                    Presets
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => handlePresetClick(preset)}
                        className="group relative h-9 rounded-xl overflow-hidden
                                   ring-1 ring-white/[0.06] hover:ring-white/[0.15]
                                   transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div
                          className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: `linear-gradient(135deg, ${preset.colorDark}, ${preset.colorMid}, ${preset.colorBright}, ${preset.colorAccent})`,
                          }}
                        />
                        <span className="relative text-[9px] font-medium text-white/90 
                                         drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}