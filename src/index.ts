import compile from './compile/index';
import { CompileOptions } from './interfaces';

export function create(source: string, options: CompileOptions = {}) {
	options.format = 'eval';

	const compiled = compile(source, options);

	if (!compiled || !compiled.js.code) {
		return;
	}

	return (new Function(`return ${compiled.js.code}`))();
}

export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess } from './preprocess/index';
export const VERSION = '__VERSION__';