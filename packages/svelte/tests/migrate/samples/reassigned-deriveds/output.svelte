<script>
	let name = $state('world');

	let upper = $derived(name.toUpperCase());
</script>

<input bind:value={name} />
<input bind:value={upper} />

{upper}