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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'grow-height': {
          '0%': { height: '0' },
          '100%': { height: '100%' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'chart-line1': {
          '0%': { height: '2rem' },
          '50%': { height: '3rem' },
          '100%': { height: '2rem' }
        },
        'chart-line2': {
          '0%': { height: '1.5rem' },
          '50%': { height: '2.5rem' },
          '100%': { height: '1.5rem' }
        },
        'chart-line3': {
          '0%': { height: '2.5rem' },
          '50%': { height: '1.5rem' },
          '100%': { height: '2.5rem' }
        },
        'chart-line4': {
          '0%': { height: '3rem' },
          '50%': { height: '2rem' },
          '100%': { height: '3rem' }
        },
        border: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' }
        },
        rotateBorder: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'gradient-xy': 'gradient-xy 15s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin': 'spin 3s linear infinite',
        'rotate-border': 'rotateBorder 8s linear infinite',
        slideInFromLeft: 'slideInFromLeft 0.3s ease-out forwards',
        slideInFromRight: 'slideInFromRight 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        'grow-height': 'grow-height 1s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'chart-line1': 'chart-line1 2s ease-in-out forwards',
        'chart-line2': 'chart-line2 2s ease-in-out forwards',
        'chart-line3': 'chart-line3 2s ease-in-out forwards',
        'chart-line4': 'chart-line4 2s ease-in-out forwards',
        border: 'border 4s ease infinite',
        'spin': 'spin 8s linear infinite'
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#60a5fa',
              },
            },
            strong: {
              color: 'inherit',
            },
            em: {
              color: 'inherit',
            },
            code: {
              color: 'inherit',
              background: 'rgba(45, 45, 45, 0.5)',
              borderRadius: '0.25rem',
              padding: '0.125rem 0.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} 