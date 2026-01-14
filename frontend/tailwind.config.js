/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", /* gray-800 */
        input: "var(--color-input)", /* gray-800 */
        ring: "var(--color-ring)", /* cyan-500 */
        background: "var(--color-background)", /* gray-950 */
        foreground: "var(--color-foreground)", /* white */
        primary: {
          DEFAULT: "var(--color-primary)", /* cyan-500 */
          foreground: "var(--color-primary-foreground)", /* gray-950 */
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", /* purple-600 */
          foreground: "var(--color-secondary-foreground)", /* white */
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", /* red-500 */
          foreground: "var(--color-destructive-foreground)", /* white */
        },
        muted: {
          DEFAULT: "var(--color-muted)", /* gray-800 */
          foreground: "var(--color-muted-foreground)", /* gray-400 */
        },
        accent: {
          DEFAULT: "var(--color-accent)", /* pink-600 */
          foreground: "var(--color-accent-foreground)", /* white */
        },
        popover: {
          DEFAULT: "var(--color-popover)", /* gray-900 */
          foreground: "var(--color-popover-foreground)", /* white */
        },
        card: {
          DEFAULT: "var(--color-card)", /* gray-900 */
          foreground: "var(--color-card-foreground)", /* white */
        },
        success: {
          DEFAULT: "var(--color-success)", /* green-400 */
          foreground: "var(--color-success-foreground)", /* gray-950 */
        },
        warning: {
          DEFAULT: "var(--color-warning)", /* orange-600 */
          foreground: "var(--color-warning-foreground)", /* white */
        },
        error: {
          DEFAULT: "var(--color-error)", /* red-500 */
          foreground: "var(--color-error-foreground)", /* white */
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(0, 255, 255, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
}