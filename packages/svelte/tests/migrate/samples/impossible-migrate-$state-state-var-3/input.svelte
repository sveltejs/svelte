<script>
	let state = 'world';

	$: other = 42;
</script>

<input bind:value={other} />