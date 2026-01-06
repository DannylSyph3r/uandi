"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { SnowEffect } from "@/components/effects/SnowEffect";

interface Effect {
  name: string;
  slug: string;
  description: string;
  tag: string;
}

const effects: Effect[] = [
  {
    name: "Fractal Glass",
    slug: "fractalglass",
    description: "Aurora-like flowing waves behind ribbed glass with customizable colors and dynamics.",
    tag: "Visual",
  },
];

function EffectCard({ effect, index }: { effect: Effect; index: number }) {
  return (
    <Link
      href={`/${effect.slug}`}
      className="group relative block"
      style={{ animationDelay: `${index * 100 + 300}ms` }}
    >
      {/* Default white border */}
      <div className="absolute -inset-[2px] rounded-xl bg-white/20 group-hover:opacity-0 transition-opacity duration-500" />
      
      {/* Animated gradient border on hover */}
      <div className="absolute -inset-[2px] rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Inner card */}
      <div className="relative rounded-xl bg-zinc-950 p-4 transition-all duration-300">
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-out" />
        
        {/* Top row */}
        <div className="relative flex items-start justify-between mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-medium bg-white/[0.06] text-white/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-300/70 transition-colors duration-300">
            {effect.tag}
          </span>
          <ArrowUpRight className="h-4 w-4 text-white/20 transition-all duration-300 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        {/* Title */}
        <h3 className="relative text-lg font-medium text-white/90 mb-1 tracking-tight group-hover:text-white transition-colors">
          {effect.name}
        </h3>

        {/* Description */}
        <p className="relative text-xs text-white/40 leading-relaxed group-hover:text-white/55 transition-colors">
          {effect.description}
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Snow with forest green tint - slightly tinted white */}
      <SnowEffect color="240, 255, 245" />
      
      {/* Ambient background glow - forest green */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Built with love */}
          <p className="text-sm text-white/30">
            Built with <span className="text-emerald-400/80">♥</span> by <span className="text-white/50">Slethware</span>
          </p>

          {/* Star on GitHub button */}
          <a
            href="https://github.com/slethware/sleth-ui-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-sm text-white/70 hover:text-white transition-all duration-300"
          >
            {/* Gradient border - shown on hover */}
            <div className="absolute inset-0 rounded-full p-[1px] bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-full rounded-full bg-zinc-900" />
            </div>
            {/* Default border */}
            <div className="absolute inset-0 rounded-full border border-white/[0.12] group-hover:border-transparent transition-colors duration-300" />
            {/* Content */}
            <svg className="relative w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="relative text-xs font-medium">Star on GitHub</span>
          </a>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-24 relative z-10">
        {/* Header */}
        <header className="mb-12 animate-fade-in">
          {/* Logo mark - forest green */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
              Experiments
            </span>
          </div>

          {/* Title with forest green gradient */}
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight mb-4">
            <span className="text-white">Sleth</span>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent italic font-serif">
              UI
            </span>
            <span className="text-white">Lab</span>
          </h1>
          
          <p className="text-base text-white/40 max-w-md leading-relaxed">
            A curated collection of experimental interfaces 
            and visual effects.
          </p>
        </header>

        {/* Effects list - closer to header now */}
        <section className="animate-fade-in-up">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/30">
              Effects
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
            <span className="text-[10px] text-white/20">
              {effects.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="space-y-3">
            {effects.map((effect, index) => (
              <EffectCard key={effect.slug} effect={effect} index={index} />
            ))}
          </div>
        </section>


      </div>
    </main>
  );
}