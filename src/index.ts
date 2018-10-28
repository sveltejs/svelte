import compile from './compile/index';
import { CompileOptions } from './interfaces';
import deprecate from './utils/deprecate';

export function create(source: string, options: CompileOptions = {}) {
	const onerror = options.onerror || (err => {
		throw err;
	});

	if (options.onerror) {
		// TODO remove in v3
		deprecate(`Instead of using options.onerror, wrap svelte.create in a try-catch block`);
		delete options.onerror;
	}

	options.format = 'eval';

	try {
		const compiled = compile(source, options);

		if (!compiled || !compiled.js.code) {
			return;
		}

		return (new Function(`return ${compiled.js.code}`))();
	} catch (err) {
		onerror(err);
	}
}

export { default as compile } from './compile/index';
export { default as parse } from './parse/index';
export { default as preprocess } from './preprocess/index';
export const VERSION = '__VERSION__';