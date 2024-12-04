<!-- @migration-task Error while migrating Svelte code: can't migrate `$: other = 42;` to `$state` because there's a variable named state.
     Rename the variable and try again or migrate by hand. -->
<script>
	let state = 'world';

	$: other = 42;
</script>

<input bind:value={other} />