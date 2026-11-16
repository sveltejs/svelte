<script>
	import { getAbortSignal } from 'svelte';

	let count = $state(0);
	let value = $state.raw(Promise.resolve('one'));

	/** @type {Map<number, (n: number) => void>} */
	const answers = new Map();

	/**
	 * @param {number} n
	 * @param {AbortSignal} signal
	 */
	function slow(n, signal) {
		console.log(n);

		return new Promise((resolve, reject) => {
			answers.set(n, resolve);
			signal.addEventListener('abort', () => {
				console.log(`aborted ${n}`);
				reject(signal.reason);
			});
		});
	}

	export function bump() {
		count++;
	}

	export function resolve() {
		for (const [n, fn] of answers) fn(n);
	}

	const shown = $derived(await value);
	const held = $derived(await slow(count, getAbortSignal()));
</script>

<p>{shown} {held}</p>
