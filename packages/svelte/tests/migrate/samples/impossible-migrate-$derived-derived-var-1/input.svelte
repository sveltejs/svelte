<script>
	let name = 'world';

	let derived;

	$: other = name;
</script>

<input bind:value={name} />