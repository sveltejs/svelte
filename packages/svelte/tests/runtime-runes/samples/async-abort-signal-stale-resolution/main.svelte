<script>
	import { getAbortSignal } from 'svelte';

	let n = $state(0);

	const resolvers = [];

	function delay(value) {
		return new Promise((resolve) => {
			resolvers.push(() => resolve(value));
		});
	}

	function shift() {
		resolvers.shift()?.();
	}

	function condition(n) {
		console.log(`started ${n}`);

		getAbortSignal().onabort = () => {
			console.log(`aborted ${n}`);
		};

		return true;
	}

	setTimeout(shift);
</script>

<button onclick={() => n++}>increment</button>
<button onclick={shift}>shift</button>

<p>{await delay(n)}</p>

{#if condition(n)}<p>true</p>{/if}
