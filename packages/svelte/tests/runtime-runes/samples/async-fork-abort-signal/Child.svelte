<script>
	import { getAbortSignal } from 'svelte';
	import { createSubscriber } from 'svelte/reactivity';

	let { id } = $props();

	function watch(n) {
		const sub = createSubscriber(() => {
			const signal = getAbortSignal();
			console.log('start', n);
			signal.addEventListener('abort', () => console.log('abort', n));
			return () => console.log('stop', n);
		});
		sub();
		return n;
	}
</script>

{#if watch(id) > 0}
	<output>{id}</output>
{/if}
