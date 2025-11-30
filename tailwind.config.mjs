/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// BRAND: 'Kintsugi' (La elegancia de la imperfección)
				brand: {
					DEFAULT: '#C8AA6E', // Antique Gold / Arena Húmeda
					hover: '#B09257', // Un poco más oscuro y profundo
					light: 'rgba(200, 170, 110, 0.08)', // Brillo apenas perceptible
					text: '#DCC38E', // Para texto destacado
				},

				// SURFACE: 'Sumi-e' (Tinta y Carbón)
				surface: {
					base: '#0F0F0E', // 'Soot' - Fondo principal
					card: '#181817', // 'Dark Stone' - Tarjetas
					floating: '#222220', // 'Wet Stone' - Modales/Dropdowns
					highlight: '#2C2C2A', // Hover sutil
				},

				// CONTENT: 'Washi' (Papel de arroz)
				content: {
					primary: '#E8E8E3', // Blanco Hueso / Papel viejo
					secondary: '#A1A19A', // Gris Piedra (Stone Grey)
					muted: '#666660', // Gris Ceniza
					inverse: '#141413', // Texto oscuro sobre el dorado
				},

				// BORDERS: Sutiles, como trazos de pincel
				border: {
					DEFAULT: '#2C2C2A', // Borde estructural suave
					weak: '#222220', // Divisiones apenas visibles
					strong: '#444440', // Foco
				},

				// STATUS: Colores Naturales (Desaturados)
				status: {
					success: '#758E78', // 'Bonsai Green'
					error: '#A86E6E', // 'Dried Plum'
					warning: '#C4A070', // 'Bamboo'
					info: '#7D8C9E', // 'River Stone'
				}
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Playfair Display', 'Merriweather', 'serif'],
			},
			letterSpacing: {
				zen: '0.02em', // Base tracking for that "Zen" feel
				widest: '0.15em', // For uppercase labels
			},
			animation: {
				'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
				'slide-in-right': 'slideInRight 0.5s ease-out forwards', // Slower
				'spin-slow': 'spin 3s linear infinite',
				'modal-in': 'modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards', // Slower
				'modal-out': 'modalOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards', // Slower
				'toast-in': 'toastIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards', // Slower
				'toast-out': 'toastOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards', // Slower
				'backdrop-in': 'backdropIn 0.4s ease-out forwards', // Slower
				'backdrop-out': 'backdropOut 0.3s ease-in forwards', // Slower
				'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', // Slower
				'shake': 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both', // Slower
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
				modalIn: {
					'0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
					'100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
				},
				modalOut: {
					'0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
					'100%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
				},
				toastIn: {
					'0%': { opacity: '0', transform: 'translateX(100%)' },
					'100%': { opacity: '1', transform: 'translateX(0)' },
				},
				toastOut: {
					'0%': { opacity: '1', transform: 'translateX(0)' },
					'100%': { opacity: '0', transform: 'translateX(100%)' },
				},
				backdropIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				backdropOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				scaleIn: {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				shake: {
					'10%, 90%': { transform: 'translateX(-1px)' },
					'20%, 80%': { transform: 'translateX(2px)' },
					'30%, 50%, 70%': { transform: 'translateX(-4px)' },
					'40%, 60%': { transform: 'translateX(4px)' },
				},
			},
		},
	},
	plugins: [],
}
