<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let count = $state(0);
	let f: Fork;
	const queued: Array<() => void> = [];

	function push(value: number) {
		console.log(value);
		return new Promise<number>((resolve) => queued.push(() => resolve(value)));
	}
</script>

<button onclick={() => (f = fork(() => (count = 1)))}>fork</button>
<button onclick={() => f.discard()}>discard</button>
<button onclick={() => (count = 2)}>real</button>
<button onclick={() => queued.shift()?.()}>shift</button>
<button onclick={() => queued.splice(1, 1)[0]?.()}>shift second</button>

<output>
	{#if count > 0}
		<Child {count} {push} />
	{/if}
</output>
