import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Library theme palette
                'primary': '#d41132',
                'background-light': '#f8f6f6',
                'background-dark': '#221013',
                'wood-dark': '#3e2723',
                'wood-light': '#5d4037',
                'paper': '#f5f5dc',
                'gold': '#ffb300',
                // Accent shades for borders/panels
                'library-panel': '#2a1619',
                'library-border': '#482329',
                'library-border-light': '#67323b',
                'library-text-muted': '#c9929b',
            },
            fontFamily: {
                'display': ['var(--font-noto-serif)', 'Noto Serif', 'serif'],
                'body': ['var(--font-noto-sans)', 'Noto Sans', 'sans-serif'],
            },
            backgroundImage: {
                'shelf-shadow': 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))',
                'book-gradient-1': 'linear-gradient(90deg, #881e1e 0%, #d41132 10%, #a00e26 100%)',
                'book-gradient-2': 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 10%, #1d4ed8 100%)',
                'book-gradient-3': 'linear-gradient(90deg, #3f6212 0%, #65a30d 10%, #4d7c0f 100%)',
                'book-gradient-4': 'linear-gradient(90deg, #4a044e 0%, #a21caf 10%, #7e22ce 100%)',
                'leather-texture': 'url("https://www.transparenttextures.com/patterns/leather.png")',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(255, 200, 100, 0.1)',
                'book': '5px 5px 15px rgba(0,0,0,0.5), inset 2px 0 5px rgba(255,255,255,0.1)',
            },
        },
    },
    plugins: [],
}

export default config
