export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess } from './preprocess/index';
export { walk } from 'estree-walker';
export type { CompileOptions, ModuleFormat, EnableSourcemap, CssHashGetter } from './interfaces';

export const VERSION: string = '__VERSION__';
