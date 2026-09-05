interface IconProps {
  size?: number;
  className?: string;
}

const base = (size?: number) => ({
  width: size ?? 18,
  height: size ?? 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPlay = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M7 4.5 19 12 7 19.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const IconPause = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const IconSound = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" stroke="none" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
);

export const IconMuted = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" stroke="none" />
    <path d="m16 9 5 6M21 9l-5 6" />
  </svg>
);

export const IconDew = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3s6 6.8 6 11a6 6 0 0 1-12 0c0-4.2 6-11 6-11Z" fill="currentColor" stroke="none" opacity="0.9" />
    <circle cx="10" cy="13.5" r="1.6" fill="#eafcff" stroke="none" />
  </svg>
);

export const IconBlade = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 20c8-1 14-7 16-16-9 2-15 8-16 16Z" fill="currentColor" stroke="none" />
    <path d="M4 20 9 15" />
  </svg>
);

export const IconSweep = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 19a15 15 0 0 1 15-15" strokeDasharray="3 3.4" />
    <path d="M4 19a9 9 0 0 1 9-9" />
    <circle cx="4" cy="19" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconLegs = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 17c5 0 6-9 11-9h7" />
    <path d="m17 4 4 4-4 4" />
    <path d="M3 21h18" opacity="0.5" />
  </svg>
);

export const IconHeart = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path
      d="M12 20s-7.5-4.6-9.3-9.2C1.5 7.6 3.6 4.5 6.8 4.5c2 0 3.6 1.1 4.4 2.7l.8 1.5.8-1.5c.8-1.6 2.4-2.7 4.4-2.7 3.2 0 5.3 3.1 4.1 6.3C19.5 15.4 12 20 12 20Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

export const IconRegen = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a8 8 0 1 1-2.3-5.6" />
    <path d="M20 3v5h-5" />
    <path d="M12 8.5v7M8.5 12h7" />
  </svg>
);

export const IconTrophy = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" fill="currentColor" stroke="none" />
    <path d="M8 5H4.5v1.5A3.5 3.5 0 0 0 8 10M16 5h3.5v1.5A3.5 3.5 0 0 1 16 10" />
    <path d="M12 14v3M8.5 20.5h7M10 17.5h4v3h-4Z" fill="currentColor" />
  </svg>
);

export const IconSkull = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.6 1.3 4.6 3 5.8V20a1.5 1.5 0 0 0 1.5 1.5h6A1.5 1.5 0 0 0 16.5 20v-3.7c1.7-1.2 3-3.2 3-5.8A7.5 7.5 0 0 0 12 3Z" />
    <circle cx="9" cy="11" r="1.7" fill="currentColor" stroke="none" />
    <circle cx="15" cy="11" r="1.7" fill="currentColor" stroke="none" />
    <path d="M10.5 21v-2.4M13.5 21v-2.4" />
  </svg>
);

export const IconClock = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const IconGrass = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 20c0-6 1-11 3-15 .5 4 0 10-1 15" fill="currentColor" stroke="none" />
    <path d="M12 20c-.5-7 .5-12 2.5-16 .3 5-.5 11-1 16" fill="currentColor" stroke="none" opacity="0.85" />
    <path d="M19 20c.5-5 0-9-1.5-12-.6 3.5-.3 8 .2 12" fill="currentColor" stroke="none" opacity="0.7" />
    <path d="M2.5 20h19" />
  </svg>
);

export const IconBot = ({ size, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <circle cx="9.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 8V4.5M9 4.5h6" />
  </svg>
);

export const IconScytheLogo = ({ size, className }: IconProps) => (
  <svg width={size ?? 40} height={size ?? 40} viewBox="0 0 48 48" fill="none" className={className}>
    <path
      d="M40 6C22 8 9 20 6 38c10-2 16-6 20-12 3.5 1.5 8 1 10-2-4.5.5-8-.8-9.5-3C33 17 38 12 40 6Z"
      fill="#ffd23f"
      stroke="#8a5a00"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M8 40 26 22" stroke="#d8b23f" strokeWidth="4" strokeLinecap="round" />
    <path d="M6 42l3-3" stroke="#8a5a00" strokeWidth="4" strokeLinecap="round" />
  </svg>
);
