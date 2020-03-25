<script>
	export let people;
</script>

{#with people as { name: { first: f, last: l } } }
	<input bind:value={f}>
	<input bind:value={l}>
	<p>{f} {l}</p>
{/with}
