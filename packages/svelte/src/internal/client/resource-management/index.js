import { teardown } from '../reactivity/effects.js';

/**
 * @param  {...any} disposables
 */
export function dispose(...disposables) {
	teardown(() => {
		for (const disposable of disposables) {
			// @ts-ignore Symbol.dispose may or may not exist as far as TypeScript is concerned
			disposable?.[Symbol.dispose]();
		}
	});
}

/**
 * In dev, check that a value used with `using` is in fact disposable. We need this
 * because we're replacing `using foo = ...` with `const foo = ...` if the
 * declaration is at the top level of a component
 * @param {any} value
 */
export function disposable(value) {
	// @ts-ignore Symbol.dispose may or may not exist as far as TypeScript is concerned
	if (value != null && !value[Symbol.dispose]) {
		throw new TypeError('Symbol(Symbol.dispose) is not a function');
	}

	return value;
}
