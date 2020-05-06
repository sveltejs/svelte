import '../ambient';

export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess } from './preprocess/index';
export { walk } from 'estree-walker';

export const version = __VERSION__;
