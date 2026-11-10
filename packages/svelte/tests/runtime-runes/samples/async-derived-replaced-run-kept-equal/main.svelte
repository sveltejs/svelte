<script>
	import { getAbortSignal } from 'svelte';

	let n = $state(0);

	const resolvers = [];

	function delay(value) {
		return new Promise((fulfil) => resolvers.push(() => fulfil(value)));
	}

	function shift() {
		resolvers.shift()?.();
	}

	function plain(n) {
		console.log(`plain ${n}`);
		return true;
	}

	function with_signal(n) {
		console.log(`signal ${n}`);
		getAbortSignal().onabort = () => console.log(`aborted ${n}`);
		return true;
	}

	// nothing (including the buttons) shows up until the initial render resolves
	queueMicrotask(shift);
</script>

<button onclick={() => n++}>increment</button>
<button onclick={shift}>shift</button>

<p>{await delay(n)}</p>

{#if plain(n)}<span>plain</span>{/if}
{#if with_signal(n)}<span>signal</span>{/if}
