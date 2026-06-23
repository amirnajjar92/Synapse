import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(0, 0%, 14.9%)",
        input: "hsl(0, 0%, 14.9%)",
        ring: "hsl(0, 0%, 83.1%)",
        primary: {
          DEFAULT: "hsl(0, 0%, 98%)",
          foreground: "hsl(0, 0%, 9%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 14.9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84.2%, 60.2%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 3.9%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 14.9%)",
          foreground: "hsl(0, 0%, 63.9%)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
