/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "sm": "640px",
        "md": "768px",
        "lg": "1024px",
        "xl": "1280px",
        "2xl": "1400px",
        "tablet": "768px",
      },
    },
    extend: {
      colors: {
        ocean: {
          deep: "#051e2f",
          medium: "#0a3a5a",
          shallow: "#0c4c74",
          surface: "#00b4d8",
          highlight: "#0077b6",
          text: "#90e0ef",
          lightText: "#ade8f4",
          coral: "#ff6b6b",
          seafoam: "#48cae4",
          sand: "#ffd166"
        },
        neon: {
          purple: "#b026ff",
          pink: "#ff2d6d",
          yellow: "#ffed4a"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#E5DEFF",
          foreground: "#221F26",
        },
        secondary: {
          DEFAULT: "#F6F6F7",
          foreground: "#221F26",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
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
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        },
        "wave": {
          "0%": { transform: "translateX(0) translateZ(0) scaleY(1)" },
          "50%": { transform: "translateX(-25%) translateZ(0) scaleY(0.8)" },
          "100%": { transform: "translateX(-50%) translateZ(0) scaleY(1)" }
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.8" },
          "50%": { transform: "scale(1.5)", opacity: "0.5" },
          "100%": { transform: "scale(2.2)", opacity: "0" }
        },
        "pulse-glow": {
          "0%, 100%": { 
            opacity: "0.6",
            filter: "blur(10px) brightness(1.2)"
          },
          "50%": { 
            opacity: "1",
            filter: "blur(15px) brightness(1.5)"
          }
        },
        "ripple": {
          "0%": { 
            transform: "scale(0.95)",
            opacity: "0.8"
          },
          "50%": { 
            transform: "scale(1.25)",
            opacity: "0.4"
          },
          "100%": { 
            transform: "scale(1.8)",
            opacity: "0"
          }
        },
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "float": {
          "0%": {
            transform: "translateY(0px)",
            opacity: "0.3",
          },
          "50%": {
            transform: "translateY(-20px)",
            opacity: "0.6",
          },
          "100%": {
            transform: "translateY(0px)",
            opacity: "0.3",
          },
        },
        "tentacle": {
          "0%": {
            transform: "rotate(-5deg) scaleY(0.95) translateY(0)",
          },
          "50%": {
            transform: "rotate(5deg) scaleY(1.05) translateY(-10px)",
          },
          "100%": {
            transform: "rotate(-5deg) scaleY(0.95) translateY(0)",
          },
        },
        "tentacle-sway": {
          "0%": {
            transform: "rotate(-8deg) translateX(-5px)",
          },
          "25%": {
            transform: "rotate(-2deg) translateX(0px)",
          },
          "50%": {
            transform: "rotate(8deg) translateX(5px)",
          },
          "75%": {
            transform: "rotate(2deg) translateX(0px)",
          },
          "100%": {
            transform: "rotate(-8deg) translateX(-5px)",
          },
        },
        "followCursor": {
          "0%": { transform: "translate(0, 0) rotate(0deg)" },
          "33%": { transform: "translate(5px, 5px) rotate(5deg)" },
          "66%": { transform: "translate(-5px, 2px) rotate(-5deg)" },
          "100%": { transform: "translate(0, 0) rotate(0deg)" },
        },
        "sectionFadeIn": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "sectionSlideUp": {
          "0%": { transform: "translateY(50px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 15s ease infinite",
        "text": "gradient-x 5s ease infinite",
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "float": "float 5s ease-in-out infinite",
        "tentacle": "tentacle 8s ease-in-out infinite",
        "tentacle-sway": "tentacle-sway 12s ease-in-out infinite",
        "followCursor": "followCursor 3s ease-out infinite",
        "sectionFadeIn": "sectionFadeIn 0.8s ease-out forwards",
        "sectionSlideUp": "sectionSlideUp 0.8s ease-out forwards",
        "wave": "wave 25s linear infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        "ripple": "ripple 0.8s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
