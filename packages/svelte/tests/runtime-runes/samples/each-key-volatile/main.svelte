<script>
	let things = $state([
		{ group: 'a', id: 1 },
		{ group: 'b', id: 2 }
	]);

	function update() {
		things = [
			{ group: 'c', id: 3 },
			{ group: 'd', id: 4 }
		];
	}
</script>

<button onclick={update}>update</button>

{#each things as thing ([thing.group, thing.id])}
	<p>{thing.group}-{thing.id}</p>
{/each}
