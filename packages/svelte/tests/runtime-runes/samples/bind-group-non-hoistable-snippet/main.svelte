<script>
	let group = $state({ selected: undefined });
</script>

{#snippet radio(group, value)}
	<input type="radio" bind:group={group.selected} {value}/>
{/snippet}

{@render radio(group, "cool")}
{@render radio(group, "cooler")}

<p>{group.selected}</p>