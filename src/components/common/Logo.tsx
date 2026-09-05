interface LogoProps {
  size?: number;
}

/** Marca da aplicação usada no Header (e futuramente nas telas de login). */
export function Logo({ size = 24 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2 22 7 12 12 2 7Z" fill="#F0554A" />
      <path d="M12 12 22 7v5L12 17 2 12V7Z" fill="#F0554A" opacity="0.6" />
      <path d="M12 17 22 12v5L12 22 2 17v-5Z" fill="#F0554A" opacity="0.35" />
    </svg>
  );
}
