import { readFileSync } from 'node:fs';
import { compile } from '../../packages/svelte/src/compiler/index.js';

const code = readFileSync('src/App.svelte', 'utf8');

console.log(compile(code));
