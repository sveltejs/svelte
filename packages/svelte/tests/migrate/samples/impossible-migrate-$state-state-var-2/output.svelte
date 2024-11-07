<!-- @migration-task Error while migrating Svelte code: can't migrate `let other = 42;` to `$state` because there's a variable named state -->
<script>
	let state = 'world';

	let other = 42;
</script>

<input bind:value={other} />