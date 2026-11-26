<script>
	import { fork } from 'svelte';
	import Child from './Child.svelte';

	const queued = [];

	let count = $state(0);
	let f;

	/** @param {number} n */
	function push(n) {
		console.log(n)
		return new Promise((resolve) => queued.push(() =>resolve(n)));
	}
</script>

<button onclick={() => f = fork(() => {count=1})}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => count = 2}>real</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.splice(1,1)[0]?.()}>shift second</button>

{#if count > 0}
	<Child {count} {push} />
{/if}
