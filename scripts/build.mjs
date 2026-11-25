// Builds dist/: ESM + CJS bundles (React stays external), type declarations, and the CSS / token files.
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist');

const common = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  jsx: 'automatic',
  target: 'es2019',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  banner: { js: '"use client";' }, // hooks and DOM APIs: client components in React Server Components setups
  legalComments: 'none',
};
await esbuild.build({ ...common, format: 'esm', outfile: 'dist/index.js' });
await esbuild.build({ ...common, format: 'cjs', outfile: 'dist/index.cjs' });

execFileSync('npx', ['tsc', '-p', 'tsconfig.json'], { stdio: 'inherit' });

const read = (f) => fs.readFileSync(`src/styles/${f}`, 'utf8');
for (const f of ['tokens.css', 'components.css', 'base.css', 'tokens.json']) fs.copyFileSync(`src/styles/${f}`, `dist/${f}`);
fs.writeFileSync('dist/styles.css', ['/* Fly UI — tokens, page defaults and components in one file. */', read('tokens.css'), read('base.css'), read('components.css')].join('\n'));

console.log('built', fs.readdirSync('dist').join(', '));
