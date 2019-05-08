<script>
	import Nested from './Nested.svelte';

	export let list;
	export let activeId;
</script>

<ul>
	{#each list as item (item.id)}
		<li>
			<Nested {item} />
			{#if item.id === activeId && item.children}
				<svelte:self list={item.children} />
			{/if}
		</li>
	{/each}
</ul>
