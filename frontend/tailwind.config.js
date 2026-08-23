/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Mono"', 'monospace'],
        editorial: ['"Gill Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        kobuObsidian: '#242429',
        kobuParchment: '#f9f5f2',
        kobuGallery: '#ffffff',
        kobuInk: '#000000',
        kobuGraphite: '#3e3e3e',
        kobuAsh: '#919191',
        kobuCharcoal: '#070707',
        // Legacy alias mappings
        tnPrimary: '#242429',
        tnDark: '#070707',
        tnBg: '#f9f5f2',
        tnGold: '#242429'
      }
    },
  },
  plugins: [],
}
