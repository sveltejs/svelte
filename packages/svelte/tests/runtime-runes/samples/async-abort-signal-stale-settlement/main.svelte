<script lang="ts">
	import { getAbortSignal } from 'svelte';

	let n = $state(0);
	const answers = new Map<string, PromiseWithResolvers<number>>();

	function load(value: number, fallback: boolean) {
		const signal = getAbortSignal();
		if (value === 0) return Promise.resolve(0);

		const d = Promise.withResolvers<number>();
		answers.set(`${value}/${fallback}`, d);

		return d.promise.catch((error) => {
			console.log(`rejected ${value} ${signal.aborted}`);
			if (fallback) return -1;
			throw error;
		});
	}

	function reject() {
		for (const fallback of [true, false]) {
			// Deliberately reject with a different error, not the abort signal's reason.
			answers.get(`${n - 1}/${fallback}`)!.reject(new Error('obsolete'));
		}
	}

	function resolve() {
		for (const fallback of [true, false]) {
			answers.get(`${n}/${fallback}`)!.resolve(n);
		}
	}
</script>

<button onclick={() => n++}>increment</button>
<button onclick={reject}>reject obsolete</button>
<button onclick={resolve}>resolve latest</button>

<output>
	<svelte:boundary>
		<p>{n}: {await load(n, true)}</p>
		<p>{n}: {await load(n, false)}</p>
		{#snippet failed(error)}<p>failed: {(error as Error).message}</p>{/snippet}
	</svelte:boundary>
</output>
