import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M21.94 4.66 18.9 19.01c-.23 1.01-.83 1.26-1.68.79l-4.63-3.41-2.23 2.15c-.25.25-.45.45-.93.45l.33-4.71 8.58-7.75c.37-.33-.08-.52-.58-.18L7.16 13.03 2.6 11.6c-.99-.31-1.01-.99.21-1.47l17.84-6.88c.83-.31 1.55.19 1.29 1.41Z" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Контурная иконка зуба в стиле lucide. */
export function ToothIcon(props: IconProps) {
  return (
    <svg
      {...base}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.5 3.2c1.6-.5 3 .1 4.5.8 1.5-.7 2.9-1.3 4.5-.8 2.6.8 3.8 3.6 3.1 6.7-.4 1.7-1.2 2.9-1.6 4.6-.5 2.2-.6 4.5-1.6 6.1-.6 1-1.9.9-2.3-.2-.5-1.4-.6-3.6-2.1-3.6s-1.6 2.2-2.1 3.6c-.4 1.1-1.7 1.2-2.3.2-1-1.6-1.1-3.9-1.6-6.1-.4-1.7-1.2-2.9-1.6-4.6-.7-3.1.5-5.9 3.1-6.7Z" />
      <path d="M9 7.2c1 .1 2 .5 3 1" />
    </svg>
  );
}
