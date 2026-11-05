<script>
	import { fork, getAbortSignal } from 'svelte';

	let n = $state(0);
	let f = null;

	function condition(n) {
		console.log(`started ${n}`);

		getAbortSignal().onabort = () => {
			console.log(`aborted ${n}`);
		};

		return true;
	}
</script>

<button onclick={() => n++}>increment</button>
<button onclick={() => (f ??= fork(() => n++))}>fork</button>
<button
	onclick={() => {
		f?.commit();
		f = null;
	}}>commit</button
>
<button
	onclick={() => {
		f?.discard();
		f = null;
	}}>discard</button
>

{#if condition(n)}{n}{/if}
