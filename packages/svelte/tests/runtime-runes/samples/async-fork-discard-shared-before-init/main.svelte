<script lang="ts">
	import { fork, type Fork } from 'svelte';
	import Child from './Child.svelte';

	let x = $state(0);
	let speculative: Fork | undefined;
	const initial = Promise.withResolvers<void>();
	const queue: Array<() => void> = [];

	function begin() {
		console.log('begin');
		return initial.promise;
	}

	function load(value: number, ready: void) {
		console.log(`load ${value}`);
		return new Promise<number>((resolve) => queue.push(() => resolve(value)));
	}
</script>

<button onclick={() => (speculative = fork(() => (x = 1)))}>fork</button>
<button onclick={() => (x = 2)}>real</button>
<button onclick={() => speculative?.discard()}>discard</button>
<button onclick={() => initial.resolve()}>begin</button>
<button onclick={() => queue.shift()?.()}>resolve</button>

<output>
	{#if x > 0}
		<Child {x} {begin} {load} />
	{/if}
</output>
