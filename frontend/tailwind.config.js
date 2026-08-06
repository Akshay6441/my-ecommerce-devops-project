/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        // ── Brand tokens (warm lifestyle palette) ─────────────────────────────
        // brand-primary: magenta/pink — CTAs, active nav, primary actions
        brand: {
          50:  "#fff0f8",
          100: "#ffe0f2",
          200: "#ffc2e6",
          300: "#ff8fce",
          400: "#f950ab",
          500: "#E91E8C",   // --brand-primary
          600: "#cc0d74",
          700: "#a80a5f",
          800: "#880d4f",
          900: "#710e44",
        },
        // brand-secondary: orange — secondary CTAs, "Shop Now", promo
        orange: {
          400: "#ffac5f",
          500: "#FF7A1A",   // --brand-secondary
          600: "#e86300",
          700: "#c25300",
        },
        // accent-purple: hero bgs, featured badges, electronics tint
        purple: {
          50:  "#f5f0ff",
          100: "#ede0ff",
          200: "#d9bfff",
          300: "#bf8fff",
          400: "#a366f5",
          500: "#9B4FE0",   // --accent-purple
          600: "#8338cc",
          700: "#6a28aa",
          800: "#562192",
          900: "#431b73",
        },
        // Keep primary as alias to brand for existing classes
        primary: {
          50:  "#fff0f8",
          100: "#ffe0f2",
          200: "#ffc2e6",
          300: "#ff8fce",
          400: "#f950ab",
          500: "#E91E8C",
          600: "#cc0d74",
          700: "#a80a5f",
          800: "#880d4f",
          900: "#710e44",
          950: "#4a0030",
        },
        accent: {
          400: "#ffac5f",
          500: "#FF7A1A",
          600: "#e86300",
        },
        // Status tokens — ONLY for functional state meaning (never decorative)
        status: {
          success: "#16A34A",   // in-stock, verified, active — green
          warning: "#F59E0B",   // low stock, pending — amber
          danger:  "#DC2626",   // destructive, out-of-stock, log out — red
        },
      },
      fontFamily: {
        sans:    ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:        "0 4px 24px -4px rgba(0,0,0,0.10)",
        "card-hover":"0 8px 40px -4px rgba(0,0,0,0.18)",
        "brand-glow":"0 0 0 3px rgba(233,30,140,0.15)",
      },
      animation: {
        "fade-in":  "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
