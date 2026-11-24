<script>
	import { getAbortSignal } from 'svelte';

	const queue = [];

	let n = $state(1);
	let fizz = $state(true);
	let buzz = $state(true);

	function increment() {
		n++;

		fizz = n % 3 === 0;
		buzz = n % 5 === 0;
	}

	function push(value) {
		if (value === 1) return 1;
		const d = Promise.withResolvers();

		queue.push(() => d.resolve(value));

		const signal = getAbortSignal();
		signal.onabort = () => d.reject(signal.reason);

		return d.promise;
	}
</script>

<button onclick={increment}>
	{$state.eager(n)}
</button>

<button onclick={() => queue.shift()?.()}>shift</button>

<p>{n} = {await push(n)}</p>

{#if true}
	<p>fizz: {fizz}</p>
{/if}

{#if true}
	<p>buzz: {buzz}</p>
{/if}
