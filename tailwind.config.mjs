import { nextui } from '@nextui-org/theme';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", // nextui-org
    './*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#e0f7fa",
          100: "#b2ebf2",
          200: "#80deea",
          300: "#4dd0e1",
          400: "#26c6da",
          500: "#00bcd4",
          600: "#00acc1",
          700: "#0097a7",
          800: "#00838f",
          900: "#006064",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#f1f8e9",
          100: "#dcedc8",
          200: "#c5e1a5",
          300: "#aed581",
          400: "#9ccc65",
          500: "#8bc34a",
          600: "#7cb342",
          700: "#689f38",
          800: "#558b2f",
          900: "#33691e",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          500: "#e57373",
          600: "#f44336",
          700: "#d32f2f",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          100: "#eceff1",
          200: "#cfd8dc",
          300: "#b0bec5",
          400: "#90a4ae",
          500: "#78909c",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          500: "#ffb74d",
          600: "#ffa726",
          700: "#ff9800",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), nextui()],
}

export default config;