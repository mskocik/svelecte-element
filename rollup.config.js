import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const module = {
  input: 'index.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'dist/svelecte-element.mjs'
    }
  ],
  plugins: [
    svelte({
      onwarn: (warning, handler) => {
        // e.g. don't warn on <marquee> elements, cos they're cool
        if (warning.code === 'module-script-reactive-declaration') return;

        // let Rollup handle all other warnings normally
        handler(warning);
      }
    }),
    css({output: 'svelecte-element.css'}),
    resolve(),
    production && terser()
  ]
}

const component = {
  input: 'index.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'Svelecte',
      file: 'dist/svelecte-element.js'
    }
  ],
  plugins: [
    svelte({
      onwarn: (warning, handler) => {
        // e.g. don't warn on <marquee> elements, cos they're cool
        if (warning.code === 'module-script-reactive-declaration') return;

        // let Rollup handle all other warnings normally
        handler(warning);
      }
    }),
    css({output: 'svelecte-element.css'}),
    
    resolve(),

    production && terser()
  ]
};

export default [module, component];
