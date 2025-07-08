module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      breakAfter: {
        page: 'page',
      },
      breakBefore: {
        page: 'page',
      },
      breakInside: {
        avoid: 'avoid',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
};
