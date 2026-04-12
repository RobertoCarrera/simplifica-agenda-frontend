/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#d1fae5',
          text: '#ffffff',
        },
        secondary: {
          DEFAULT: '#64748b',
          hover: '#475569',
          light: '#f1f5f9',
          text: '#ffffff',
        },
        surface: {
          hover: '#e2e8f0',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        skeleton: {
          from: '#e2e8f0',
          to: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
