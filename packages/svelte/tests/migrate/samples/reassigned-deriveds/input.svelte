<script>
	let name = 'world';

	$: upper = name.toUpperCase();
</script>

<input bind:value={name} />
<input bind:value={upper} />

{upper}