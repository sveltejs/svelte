<script>
	import { fromStore } from 'svelte/store';
	import { writable } from 'svelte/store';

	const store = writable(0);

	const value = fromStore(store);
</script>

<div>{$store}</div>

{#if true}
	{@const doubled = value.current * 2}
	<div>{value.current}, {doubled}</div>
{/if}

<button onclick={() => $store++}>increment</button>
