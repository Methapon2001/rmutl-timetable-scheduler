const config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    boxShadow: {
      DEFAULT: 'var(--shadow)',
    },
    borderRadius: {
      DEFAULT: 'var(--rounded)',
    },
    extend: {
      colors: {
        light: {
          DEFAULT: 'var(--color-light)',
          hover: 'var(--color-light-hover)',
          disabled: 'var(--color-light-disabled)',
          inverse: 'var(--color-light-inverse)',
        },
        dark: {
          DEFAULT: 'var(--color-dark)',
          hover: 'var(--color-dark-hover)',
          disabled: 'var(--color-dark-disabled)',
          inverse: 'var(--color-dark-inverse)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          disabled: 'var(--color-primary-disabled)',
          inverse: 'var(--color-primary-inverse)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          disabled: 'var(--color-secondary-disabled)',
          inverse: 'var(--color-secondary-inverse)',
        },
      },
    },
  },

  plugins: [],
};

module.exports = config;
