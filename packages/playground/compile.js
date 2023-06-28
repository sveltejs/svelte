import { readFileSync } from 'fs';
import { compile } from '../svelte/src/compiler/index.js';

const code = readFileSync('src/App.svelte', 'utf8');

console.log(compile(code));
