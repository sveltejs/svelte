<script>
	let name = 'world';

	let derived;

	let other;
	$: other = name;
</script>

<input bind:value={name} />