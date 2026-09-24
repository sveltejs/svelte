import { ssr_context } from './context.js';

export function getAbortSignal() {
	let context = ssr_context;

	while (context !== null) {
		if (context.r !== null) return context.r.global.get_abort_signal();
		context = context.p;
	}

	return new AbortController().signal;
}
