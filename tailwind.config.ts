import type { Config } from "tailwindcss";

/**
 * Job Tracker Design System - Tailwind Configuration
 *
 * Inspired by: Linear, Attio, Intercom
 *
 * Note: In Tailwind v4, most theming is done in CSS via @theme blocks.
 * This config file is for any JavaScript-based customizations and plugins.
 * See app/globals.css for the full design system with CSS variables.
 */

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable class-based dark mode alongside prefers-color-scheme
  theme: {
    extend: {
      // Extended color palette for edge cases
      colors: {
        // Primary violet (Linear-inspired)
        primary: {
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        // Neutral slate with warmth (Attio-inspired)
        neutral: {
          0: "var(--neutral-0)",
          25: "var(--neutral-25)",
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
        // Semantic colors
        success: {
          50: "var(--success-50)",
          100: "var(--success-100)",
          200: "var(--success-200)",
          300: "var(--success-300)",
          400: "var(--success-400)",
          500: "var(--success-500)",
          600: "var(--success-600)",
          700: "var(--success-700)",
        },
        warning: {
          50: "var(--warning-50)",
          100: "var(--warning-100)",
          200: "var(--warning-200)",
          300: "var(--warning-300)",
          400: "var(--warning-400)",
          500: "var(--warning-500)",
          600: "var(--warning-600)",
          700: "var(--warning-700)",
        },
        error: {
          50: "var(--error-50)",
          100: "var(--error-100)",
          200: "var(--error-200)",
          300: "var(--error-300)",
          400: "var(--error-400)",
          500: "var(--error-500)",
          600: "var(--error-600)",
          700: "var(--error-700)",
        },
        info: {
          50: "var(--info-50)",
          100: "var(--info-100)",
          200: "var(--info-200)",
          300: "var(--info-300)",
          400: "var(--info-400)",
          500: "var(--info-500)",
          600: "var(--info-600)",
          700: "var(--info-700)",
        },
        // Theme tokens
        background: {
          DEFAULT: "var(--background)",
          subtle: "var(--background-subtle)",
          muted: "var(--background-muted)",
          elevated: "var(--background-elevated)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          muted: "var(--foreground-muted)",
          subtle: "var(--foreground-subtle)",
        },
        border: {
          DEFAULT: "var(--border)",
          muted: "var(--border-muted)",
          focus: "var(--border-focus)",
        },
        ring: "var(--ring)",
      },

      // Custom border radius
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },

      // Custom shadows (Linear-style elevated cards)
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },

      // Font sizes with line heights
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.16" }],
        display: ["3.5rem", { lineHeight: "1.1" }],
      },

      // Animation durations
      transitionDuration: {
        instant: "var(--duration-instant)",
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
        slower: "var(--duration-slower)",
      },

      // Easing functions
      transitionTimingFunction: {
        default: "var(--ease-default)",
        in: "var(--ease-in)",
        out: "var(--ease-out)",
        "in-out": "var(--ease-in-out)",
        bounce: "var(--ease-bounce)",
        spring: "var(--ease-spring)",
      },

      // Custom animations
      animation: {
        "fade-in": "fade-in 0.2s var(--ease-out)",
        "fade-out": "fade-out 0.15s var(--ease-in)",
        "slide-up": "slide-up 0.3s var(--ease-out)",
        "slide-down": "slide-down 0.3s var(--ease-out)",
        "scale-in": "scale-in 0.2s var(--ease-spring)",
        shimmer: "shimmer 2s infinite",
        "bounce-subtle": "bounce-subtle 0.6s var(--ease-default)",
      },

      // Keyframes
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },

      // Spacing additions
      spacing: {
        "0.5": "2px",
        "1.5": "6px",
        "2.5": "10px",
        "3.5": "14px",
        "18": "72px",
        "22": "88px",
        "26": "104px",
        "30": "120px",
      },

      // Screen breakpoints
      screens: {
        xs: "475px",
        "3xl": "1920px",
      },

      // Z-index scale
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
        dropdown: "1000",
        sticky: "1020",
        fixed: "1030",
        modal: "1040",
        popover: "1050",
        tooltip: "1060",
      },

      // Background images for gradients
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-primary-soft": "var(--gradient-primary-soft)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-shimmer": "var(--gradient-shimmer)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      // Max widths
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
    },
  },
  plugins: [],
};

export default config;
