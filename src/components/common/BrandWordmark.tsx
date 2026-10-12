import React from 'react';

interface BrandWordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  collapsed?: boolean;
  subtitle?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  size = 'md',
  collapsed = false,
  subtitle = true,
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none" id="brand-wordmark-container">
      {/* Geospatial polygon emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 shadow-md shadow-emerald-950/20 border border-emerald-500/30 shrink-0 ${
          size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-emerald-300 ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`}
        >
          {/* Geospatial parcel polygon outline with central benchmark */}
          <polygon points="12 2 20 7 19 18 5 19 3 8" className="stroke-emerald-300 fill-emerald-500/20" />
          <circle cx="12" cy="11" r="2.5" className="fill-amber-400 stroke-amber-200" />
          <path d="M12 2v6" className="stroke-emerald-300/60 stroke-dashed" />
          <path d="M5 19l7-8" className="stroke-emerald-300/40" />
          <path d="M19 18l-7-7" className="stroke-emerald-300/40" />
        </svg>
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-base md:text-lg font-['Space_Grotesk']">
              BHUMI
            </span>
            <span className="font-black text-xs md:text-sm px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 tracking-wider">
              360
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-[190px]">
              Integrated Land Acquisition
            </span>
          )}
        </div>
      )}
    </div>
  );
};
