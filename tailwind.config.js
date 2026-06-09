/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "#6366f1",
        background: "#0a0a0c",
        foreground: "#f3f4f6",
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgba(20, 20, 25, 0.7)",
          foreground: "#f3f4f6",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgba(30, 30, 40, 0.5)",
          foreground: "#9ca3af",
        },
        accent: {
          DEFAULT: "rgba(99, 102, 241, 0.15)",
          foreground: "#a5b4fc",
        },
        popover: {
          DEFAULT: "#0f0f13",
          foreground: "#f3f4f6",
        },
        card: {
          DEFAULT: "rgba(20, 20, 25, 0.7)",
          foreground: "#f3f4f6",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
    },
  },
  plugins: [],
}
