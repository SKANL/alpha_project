/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				brand: {
					DEFAULT: '#C84C4C', // Primary Red
					hover: '#B34444',
					light: 'rgba(200, 76, 76, 0.1)', // Transparent red for backgrounds
				},
				surface: {
					base: '#000000', // Main App Background
					card: '#0a0a0a', // Card Background
					floating: '#1A1A1A', // Modals/Dropdowns
					highlight: 'rgba(255, 255, 255, 0.05)', // Hover states
				},
				content: {
					primary: '#FFFFFF', // Headings
					secondary: '#A3A3A3', // Subtitles
					muted: '#525252', // Placeholders/Disabled
					inverse: '#000000', // Text on light backgrounds
				},
				border: {
					DEFAULT: 'rgba(255, 255, 255, 0.1)',
					weak: 'rgba(255, 255, 255, 0.05)',
					strong: 'rgba(255, 255, 255, 0.2)',
				},
				status: {
					success: '#22c55e',
					error: '#ef4444',
					warning: '#eab308',
					info: '#3b82f6',
				}
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif',
				],
			},
			letterSpacing: {
				zen: '0.02em', // Base tracking for that "Zen" feel
				widest: '0.15em', // For uppercase labels
			},
			animation: {
				'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
				'slide-in-right': 'slideInRight 0.3s ease-out forwards',
				'spin-slow': 'spin 3s linear infinite',
			},
			keyframes: {
				fadeInUp: {
					'0%': { opacity: '0', transform: 'translateY(12px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				slideInRight: {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
			},
		},
	},
	plugins: [],
}
