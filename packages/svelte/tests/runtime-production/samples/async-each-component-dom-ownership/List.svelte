<script>
	import Item from './Item.svelte';

	let names = $state(await Promise.resolve(['a', 'b', 'c']));
	const label = (name) => name;
	// Keep this call after the await so the template's label calls have a blocker.
	const unused = label('x');
</script>

{#each names as name (name)}
	<Item title={label(name)}>
		{#snippet children()}
			<button aria-label="Remove {name}" onclick={() => (names = names.filter((n) => n !== name))}>
				x
			</button>
		{/snippet}
	</Item>
{/each}
