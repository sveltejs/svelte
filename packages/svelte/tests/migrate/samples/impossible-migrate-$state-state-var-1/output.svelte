<!-- @migration-task Error while migrating Svelte code: can't migrate `let other;` to `$state` because there's a variable named state -->
<script>
	let state = 'world';

	let other;
</script>

<input bind:value={other} />