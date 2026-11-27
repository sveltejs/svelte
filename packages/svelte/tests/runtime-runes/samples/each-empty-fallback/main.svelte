<script lang="ts">
	import Empty from './Empty.svelte';

	let items = $state<string[]>([]);
</script>

{#snippet empty()}{/snippet}

<button onclick={() => (items = ['a', 'b'])}>fill</button>
<button onclick={() => (items = [])}>clear</button>

<output>
	{#each items as item}
		<span>{item}</span>
	{:else}
	{/each}
</output>

<output>
	before
	{#each items as item (item)}
		<span>{item}</span>
	{:else}
		<!-- no content -->
	{/each}
	after
</output>

<output>
	{#each items as item (item)}
		<span>{item}</span>
	{:else}
		<Empty />
	{/each}
</output>

<output>
	{#each items as item}
		<span>{item}</span>
	{:else}
		{@render empty()}
	{/each}
</output>

<output>
	{#each items as item}
		<span>{item}</span>
	{:else}
		{@const unused = items.length}
	{/each}
</output>
