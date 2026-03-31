"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Zap, Cpu, Users } from "lucide-react";

export default function AboutProject() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    {
      id: "about",
      title: "About Us",
      subtitle: "The autonomous execution engine",
      icon: <Users className="w-5 h-5 text-neon-purple" />,
      content: "PL Genesis AI is the premier autonomous execution layer for decentralized finance. Our multi-agent engine constantly monitors liquidity depth, volatility, and yield curves to ensure capital is always where it performs best. We bridge the gap between complex DeFi mechanics and effortless yield optimization, with all decisions anchored on-chain for total transparency."
    },
    {
      id: "features",
      title: "Features",
      subtitle: "Core platform capabilities",
      icon: <Zap className="w-5 h-5 text-neon-orange" />,
      content: "The PL Genesis AI suite provides industrial-grade tools for sophisticated liquidity providers. Our core capabilities include Atomic Rebalancing via intelligent routing, real-time Neural Risk Forecasting to guard capital during volatility, and a multi-agent debate panel that identifies the most efficient yield opportunities. Every strategy is executed with deterministic precision, anchored on the NEAR blockchain and IPFS for permanent verifiability."
    },
    {
      id: "architecture",
      title: "Architecture",
      subtitle: "Platform infrastructure & APIs",
      icon: <Cpu className="w-5 h-5 text-neon-purple" />,
      content: "Built on high-performance decentralized infrastructure, our architecture is engineered for absolute transparency. By leveraging NEAR Protocol for execution proofs and IPFS for reasoning logs, we eliminate the 'Black Box' problem of traditional AI. Our frontend layer maintains a direct connection to blockchain RPC nodes and IPFS gateways, ensuring that every AI decision is mathematically verifiable and eternally auditable."
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 mt-20 mb-32 space-y-6">
      <div className="flex flex-col items-center mb-12">
        <div className="w-12 h-1 bg-gradient-to-r from-neon-purple to-neon-orange mb-6 rounded-full" />
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Project Discovery</h2>
        <p className="text-[10px] text-neon-purple font-bold tracking-[0.4em] uppercase mt-2 opacity-60">Neural Infrastructure Intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {sections.map((s) => (
          <div 
            key={s.id} 
            className={`glass-dark rounded-[2.5rem] border border-white/5 overflow-hidden smooth-transition hover:-translate-y-2 group shadow-2xl relative flex flex-col
              ${s.id === 'features' 
                ? 'hover:border-neon-orange/40 hover:shadow-[0_0_60px_rgba(255,94,0,0.1)]' 
                : 'hover:border-neon-purple/40 hover:shadow-[0_0_60px_rgba(191,0,255,0.1)]'}
            `}
          >
            {/* Subtle internal glow on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none
              ${s.id === 'features' 
                ? 'bg-gradient-to-b from-neon-orange/5 to-transparent' 
                : 'bg-gradient-to-b from-neon-purple/5 to-transparent'}
            `} />

            <div className="relative p-10 flex flex-col items-center text-center z-10 flex-grow">
              <div className={`w-20 h-20 rounded-[1.8rem] bg-white/5 flex items-center justify-center border border-white/5 mb-8 smooth-transition
                ${s.id === 'features' ? 'group-hover:border-neon-orange/50 group-hover:bg-neon-orange/10' : 'group-hover:border-neon-purple/50 group-hover:bg-neon-purple/10'}
              `}>
                <div className="group-hover:scale-125 smooth-transition transform duration-500">
                  {s.icon}
                </div>
              </div>
              
              <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">{s.title}</h4>
              <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-8 smooth-transition
                ${s.id === 'features' ? 'text-neon-orange/60' : 'text-neon-purple/60'}
              `}>{s.subtitle}</p>

              <div className={`w-12 h-1 bg-gradient-to-r mb-8 rounded-full opacity-20 group-hover:opacity-100 smooth-transition
                ${s.id === 'features' ? 'from-neon-orange to-transparent' : 'from-neon-purple to-transparent'}
              `} />

              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                {s.content}
              </p>
            </div>
            
            <div className={`h-1.5 w-full mt-auto opacity-30 group-hover:opacity-100 smooth-transition
               ${s.id === 'features' ? 'bg-neon-orange shadow-[0_0_15px_rgba(255,94,0,0.5)]' : 'bg-neon-purple shadow-[0_0_15px_rgba(191,0,255,0.5)]'}
            `} />
          </div>
        ))}
      </div>
    </div>
  );
}

