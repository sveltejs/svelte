<script lang="ts">
	import Child from './Child.svelte';
	let visible = $state(false);
	let x = $state(0);
	let gate = $state(false);
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

<button onclick={() => { visible = true; x = 1; }}>show</button>
<button onclick={() => { x = 2; gate = true; }}>update</button>
<button onclick={() => resolve('value', 2)}>resolve value</button>
<button onclick={() => resolve('gate', 2)}>resolve gate</button>

<output>
	{#if gate || visible}
		<svelte:boundary>
			<Child {x} {push} label="value" />
			{#snippet pending()}<i>pending</i>{/snippet}
		</svelte:boundary>
	{/if}

	{#if gate}
		<span>{await push('gate', x)}</span>
	{/if}
</output>
