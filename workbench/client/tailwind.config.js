/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            'pre': {
              'background-color': theme('colors.gray.200'),
              'color': theme('colors.gray.900'),
            },
          },
        },
      }),
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          'primary': '#06b6d4',
          'secondary': '#10b981',
          'accent': '#8b5cf6',
          'neutral': '#71717a',
          'base-100': '#ffffff',
          'info': '#006dff',
          'success': '#06b6d4',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
    ],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
};

