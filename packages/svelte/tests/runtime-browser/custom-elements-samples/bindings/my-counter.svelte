<svelte:options
	customElement={{
		tag: 'my-counter',
		props: { count: { reflect: true, type: 'Number' } }
	}}
/>

<script lang="ts">
	let {
		count = $bindable(0),
		itemList = $bindable([]),
		mode = $bindable(),
		label = 'count'
	} = $props();

	// assignment during initialization
	if (mode === undefined) mode = 'auto';
</script>

<button class="increment" onclick={() => count++}>{label}: {count}</button>
<button class="add" onclick={() => (itemList = [...itemList, itemList.length])}>
	{itemList.join(',')}
</button>
