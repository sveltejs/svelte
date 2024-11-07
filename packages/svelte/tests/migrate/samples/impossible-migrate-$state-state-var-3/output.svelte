<!-- @migration-task Error while migrating Svelte code: can't migrate `$: other = 42;` to `$state` because there's a variable named state -->
<script>
	let state = 'world';

	$: other = 42;
</script>

<input bind:value={other} />