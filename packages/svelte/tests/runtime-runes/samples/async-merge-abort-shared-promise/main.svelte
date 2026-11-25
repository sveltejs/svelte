<script lang="ts">
	import { getAbortSignal } from 'svelte';
	import Child from './Child.svelte';

	let a = $state(false);
	let b = $state(false);
	let c = $state(false);
	let x = $state(0);
	let revision = $state(0);
	const answers = new Map<number, (value: number) => void>();

	function load(value: number, signal: AbortSignal) {
		console.log(`load ${value}`);

		return new Promise<number>((resolve, reject) => {
			answers.set(value, resolve);
			signal.addEventListener('abort', () => {
				console.log(`aborted ${value}`);
				reject(signal.reason);
			});
		});
	}

	let promise = $derived(load(x, getAbortSignal()));
</script>

<button onclick={() => { a = true; x = 1; revision++; }}>show a</button>
<button onclick={() => { b = true; revision++; }}>show b</button>
<button onclick={() => { c = true; x = 2; }}>update both</button>
<button onclick={() => answers.get(2)?.(2)}>resolve second</button>

<output>
	<span>{revision}</span>
	{#if c || a}
		<Child {promise} name="a" />
	{/if}
	{#if c || b}
		<Child {promise} name="b" />
	{/if}
</output>
