import React, { useEffect } from 'react';
import audioFX from '../audioFX'; // assuming audioFX exported

const HeroSection = () => {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.hero-section .scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero-section max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div data-scroll-parallax="0.09" className="hero-copy lg:col-span-5 space-y-6 scroll-reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Computer Science Engineer · Systems &amp; AI
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none">
            SOHAM KADAM
          </h1>
          <p className="text-base md:text-lg font-medium text-slate-300 leading-relaxed">
            Building intelligent applications and scalable backend systems with <span className="text-amber-300 font-semibold">Java, Spring Boot</span>, <span className="text-indigo-300 font-semibold">Python</span>, React and modern AI technologies.
          </p>
          <p className="text-xs font-mono text-slate-300 border-l-2 border-indigo-500/80 pl-4 py-1">
            AI Agents | MCP Protocol | Decision Workflows | Microservices
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a href="#proof-of-work" onClick={() => audioFX.playNodeClick(550)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5">
              <span>Proof of Work</span>
              <span className="text-[10px] opacity-75 font-mono">→</span>
            </a>
            <a href="#ai-work" onClick={() => audioFX.playNodeClick(500)} className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 font-medium text-xs transition-all">
              AI Projects
            </a>
            <a href="#java-work" onClick={() => audioFX.playNodeClick(450)} className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 font-medium text-xs transition-all">
              Java Projects
            </a>
          </div>
        </div>
        <div data-scroll-parallax="-0.045" className="hero-diagram lg:col-span-7 w-full scroll-reveal">
          {/* Assuming AnimatedFlowDiagram and HERO_SYSTEM_FLOW are globally available */}
          <AnimatedFlowDiagram diagramData={HERO_SYSTEM_FLOW} interactive={true} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
