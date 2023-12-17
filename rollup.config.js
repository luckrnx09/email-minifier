import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'lib/index.ts',
  output: [
    {
      file: 'dist/cjs/index.cjs',
      format: 'cjs',
    },
    {
      file: 'dist/mjs/index.mjs',
      format: 'esm',
    },
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
  external: ['jsdom', 'csso'],
};
