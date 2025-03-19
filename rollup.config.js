const { terser } = require('rollup-plugin-terser');

module.exports = {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'esm',
      exports: 'named',
    },
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [terser()],
};
