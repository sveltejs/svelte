export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess, preprocess_sync } from './preprocess/index';
export { walk } from 'estree-walker';

export const VERSION = '__VERSION__';
