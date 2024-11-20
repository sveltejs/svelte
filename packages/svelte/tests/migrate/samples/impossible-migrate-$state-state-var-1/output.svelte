<!-- @migration-task Error while migrating Svelte code: can't migrate `let other;` to `$state` because there's a variable named state.
     Rename the variable and try again or migrate by hand. -->
<script>
	let state = 'world';

	let other;
</script>

<input bind:value={other} />