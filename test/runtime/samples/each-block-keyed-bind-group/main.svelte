<script>
	let flavours = [
		'Vanilla',
		'Strawberry',
		'Chocolate',
		'Lemon',
		'Coconut'
	];

	let choices = [];

	// Put choices first by sorting
	$: flavours = flavours.sort((a, b) => choices.includes(b) - choices.includes(a));
</script>

{#each flavours as flavour (flavour)}
	<label>
		<input type=checkbox bind:group={choices} value={flavour}>
		{flavour}
	</label>
{/each}
