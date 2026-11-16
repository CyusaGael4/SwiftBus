/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#282B4A',
        'navy-light': '#3B3E5C',
        cream: '#F3F1E7',
        surface: '#FCFBF6',
        accent: '#EC5E27', orange: '#F26522',
        // Single brand orange: hover/active states reuse it so no darker
        // orange shade appears anywhere in the app.
        'accent-dark': '#EC5E27',
        border: '#DFDED3',
        muted: '#6E7085',
        'table-head': '#F1F0E8',
        success: '#476B4F',
        'success-soft': '#E7EDE5',
        warning: '#EC5E27',
        'warning-soft': '#F7E7DD',
        'warning-row': '#FBF0E6',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        modal: '0 24px 60px -20px rgba(40, 43, 74, 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
