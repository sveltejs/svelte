import { suspend } from './reactivity/batch.js';

/**
 * @param {() => Promise<void>} fn
 */
export async function async_body(fn) {
	const unsuspend = suspend();

	try {
		await fn();
	} finally {
		unsuspend();
	}
}
