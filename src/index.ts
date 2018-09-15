import compile from './compile/index';
import { CompileOptions } from './interfaces';

export function create(source: string, options: CompileOptions = {}) {
	options.format = 'eval';

	const compiled = compile(source, options);

	if (!compiled || !compiled.js.code) {
		return;
	}

	try {
		return (new Function(`return ${compiled.js.code}`))();
	} catch (err) {
		if (options.onerror) {
			options.onerror(err);
			return;
		} else {
			throw err;
		}
	}
}

export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess } from './preprocess/index';
export const VERSION = '__VERSION__';