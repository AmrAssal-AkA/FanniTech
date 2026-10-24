/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00236f",
          container: "#1e3a8a",
          fixed: "#dce1ff",
          "fixed-dim": "#b6c4ff",
        },
        secondary: {
          DEFAULT: "#0051d5",
          container: "#316bf3",
          fixed: "#dbe1ff",
          "fixed-dim": "#b4c5ff",
          "fixed-variant": "#003ea8",
        },
        tertiary: {
          DEFAULT: "#002e41",
          container: "#00455f",
          fixed: "#c4e7ff",
          "fixed-dim": "#7bd0ff",
        },
        surface: {
          DEFAULT: "#faf8ff",
          bright: "#faf8ff",
          dim: "#d2d9f4",
          variant: "#dae2fd",
          container: "#eaedff",
          "container-low": "#f2f3ff",
          "container-high": "#e2e7ff",
          "container-lowest": "#ffffff",
          "container-highest": "#dae2fd",
        },
        "on-surface": "#131b2e",
        "on-surface-variant": "#444651",
        "inverse-surface": "#283044",
        "on-primary": "#ffffff",
        "on-primary-container": "#90a8ff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#fefcff",
        outline: "#757682",
        "outline-variant": "#c5c5d3",
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
        },
        "on-error-container": "#93000a",
      },
    },
  },
  plugins: [],
}

