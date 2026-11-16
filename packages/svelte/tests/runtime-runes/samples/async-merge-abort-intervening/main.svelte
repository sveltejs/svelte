<script lang="ts">
	import Child from './Child.svelte';

	let visible = $state(false);
	let a = $state(0);
	let x = $state(0);
	const queue = new Map<string, PromiseWithResolvers<number>>();

	function push(label: string, value: number, signal?: AbortSignal) {
		const d = Promise.withResolvers<number>();
		queue.set(`${label} ${value}`, d);
		return d.promise;
	}

	function resolve(label: string, value: number) {
		queue.get(`${label} ${value}`)?.resolve(value);
	}
</script>

<button onclick={() => (visible = true, a = 1)}>first</button>
<button onclick={() => (x = 1)}>middle</button>
<button onclick={() => (a = 2, x = 2)}>last</button>
<button onclick={() => resolve('value', 2)}>resolve value 2</button>
<button onclick={() => resolve('gate', 2)}>resolve gate 2</button>
<button onclick={() => resolve('gate', 1)}>resolve gate 1</button>
<button onclick={() => resolve('value', 1)}>resolve value 1</button>

<output>
	{#if x || visible}
		<Child {a} {x} {push} />
	{/if}

	{#if x}
		<span>{await push('gate', x)}</span>
	{/if}

	{$effect.pending()}
</output>
