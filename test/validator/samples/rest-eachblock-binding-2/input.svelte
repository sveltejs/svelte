<script>
	let objArray = [
		[1, 2, 3, "4"],
		[5, 6, 7, "8"],
	];
</script>

{#each objArray as [id, ...rest] (id)}
	<input bind:value={rest[0]} type="text" placeholder={rest[2]} />
	<br />
{/each}
