const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        /* ─── Brand palette ─── */
        brand: {
          50:  'hsl(226, 100%, 97%)',
          100: 'hsl(226, 95%, 93%)',
          200: 'hsl(226, 90%, 85%)',
          300: 'hsl(226, 85%, 74%)',
          400: 'hsl(226, 78%, 62%)',
          500: 'hsl(226, 71%, 50%)',   /* Primary indigo */
          600: 'hsl(226, 75%, 42%)',
          700: 'hsl(226, 72%, 35%)',
          800: 'hsl(226, 65%, 28%)',
          900: 'hsl(226, 60%, 20%)',
          950: 'hsl(226, 60%, 12%)',
        },
        accent: {
          50:  'hsl(32, 100%, 97%)',
          100: 'hsl(32, 100%, 92%)',
          200: 'hsl(32, 100%, 83%)',
          300: 'hsl(32, 100%, 72%)',
          400: 'hsl(32, 97%, 60%)',
          500: 'hsl(32, 95%, 52%)',    /* Saffron accent */
          600: 'hsl(28, 90%, 46%)',
          700: 'hsl(24, 82%, 38%)',
          800: 'hsl(20, 72%, 32%)',
          900: 'hsl(18, 65%, 26%)',
          950: 'hsl(16, 70%, 14%)',
        },
        /* ─── Semantic verdicts ─── */
        met: {
          50:  'hsl(152, 76%, 96%)',
          100: 'hsl(152, 72%, 90%)',
          200: 'hsl(152, 68%, 78%)',
          400: 'hsl(152, 60%, 45%)',
          500: 'hsl(152, 62%, 36%)',   /* MET green */
          600: 'hsl(152, 65%, 28%)',
          700: 'hsl(152, 60%, 22%)',
        },
        notmet: {
          50:  'hsl(0, 86%, 97%)',
          100: 'hsl(0, 82%, 92%)',
          200: 'hsl(0, 78%, 82%)',
          400: 'hsl(0, 72%, 55%)',
          500: 'hsl(0, 70%, 48%)',     /* NOT MET red */
          600: 'hsl(0, 72%, 38%)',
          700: 'hsl(0, 65%, 30%)',
        },
        unknown: {
          50:  'hsl(38, 92%, 96%)',
          100: 'hsl(38, 88%, 90%)',
          200: 'hsl(38, 84%, 78%)',
          400: 'hsl(38, 76%, 52%)',
          500: 'hsl(38, 78%, 45%)',    /* UNKNOWN amber */
          600: 'hsl(34, 72%, 38%)',
          700: 'hsl(30, 65%, 30%)',
        },
        /* ─── shadcn/ui semantic tokens ─── */
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', ...fontFamily.sans],
        display: ['var(--font-jakarta)', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px 0px hsla(226, 71%, 50%, 0.15)' },
          '50%':      { boxShadow: '0 0 30px 5px hsla(226, 71%, 50%, 0.3)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          from: { '--num': '0' },
          to:   { '--num': '100' },
        },
        spotlight: {
          '0%': {
            opacity: '0',
            transform: 'translate(-72%, -62%) scale(0.5)',
          },
          '100%': {
            opacity: '1',
            transform: 'translate(-50%, -40%) scale(1)',
          },
        },
      },
      animation: {
        'accordion-down':  'accordion-down 0.2s ease-out',
        'accordion-up':    'accordion-up 0.2s ease-out',
        'fade-in':         'fade-in 0.5s ease-out',
        'fade-up':         'fade-up 0.6s ease-out',
        'slide-in-right':  'slide-in-right 0.5s ease-out',
        'pulse-glow':      'pulse-glow 3s ease-in-out infinite',
        'shimmer':         'shimmer 2s linear infinite',
        'spotlight':       'spotlight 2s ease 0.5s 1 forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
