import { getContext, setContext } from 'svelte';

const key = Symbol('repl');

/** @returns {import("./types").ReplContext} */
export function get_repl_context() {
	return getContext(key);
}

/** @param {import("./types").ReplContext} value */
export function set_repl_context(value) {
	setContext(key, value);
}
