<script>
	let toggled = $state(true);
</script>

<fieldset>
	<input type="checkbox" bind:checked={toggled} />
	<div class="container">
		<table>
			<thead><tr><th>A</th></tr></thead>
			<tbody><tr>{#if !toggled}<td>one</td>{/if}</tr></tbody>
		</table>
	</div>
	{#if toggled}<div></div>{/if}
</fieldset>

<style>
	.container {
		container-type: inline-size;
	}
</style>
