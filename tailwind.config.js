/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
      },
    },
    extend: {
      fontFamily: {
        display: ['"ZCOOL KuaiLe"', 'cursive'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      colors: {
        water: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        medal: {
          gold: '#EAB308',
          silver: '#9CA3AF',
          bronze: '#D97706',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'ripple': 'ripple 1.5s ease-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'count-up': 'countUp 0.8s ease-out',
        'like-pop': 'likePop 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { transform: 'scale(1.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        likePop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'water': '0 10px 40px -10px rgba(59, 130, 246, 0.3)',
        'card': '0 4px 20px -4px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 30px rgba(59, 130, 246, 0.2)',
      },
      backgroundImage: {
        'water-gradient': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
        'hero-gradient': 'linear-gradient(180deg, #EFF6FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
      }
    },
  },
  plugins: [],
};
