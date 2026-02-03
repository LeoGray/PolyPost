/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Background colors
                'bg-primary': 'rgb(var(--bg-primary) / <alpha-value>)',
                'bg-secondary': 'rgb(var(--bg-secondary) / <alpha-value>)',
                'bg-tertiary': 'rgb(var(--bg-tertiary) / <alpha-value>)',

                // Border colors
                'border-primary': 'rgb(var(--border-primary) / <alpha-value>)',
                'border-secondary': 'rgb(var(--border-secondary) / <alpha-value>)',

                // Accent colors
                accent: 'rgb(var(--accent) / <alpha-value>)',
                'accent-hover': 'rgb(var(--accent-hover) / <alpha-value>)',

                // Text colors
                'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
                'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
                'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',

                // Status colors
                'status-draft': 'rgb(var(--status-draft) / <alpha-value>)',
                'status-scheduled': 'rgb(var(--status-scheduled) / <alpha-value>)',
                'status-posted': 'rgb(var(--status-posted) / <alpha-value>)',

                // Tag colors
                'tag-thread': 'rgb(var(--tag-thread) / <alpha-value>)',
                'tag-polished': 'rgb(var(--tag-polished) / <alpha-value>)',
                'tag-viral': 'rgb(var(--tag-viral) / <alpha-value>)',
                'tag-technical': 'rgb(var(--tag-technical) / <alpha-value>)',
                'tag-emoji': 'rgb(var(--tag-emoji) / <alpha-value>)',
                'tag-short': 'rgb(var(--tag-short) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
