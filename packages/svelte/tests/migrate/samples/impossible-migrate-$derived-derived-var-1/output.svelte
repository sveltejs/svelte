<!-- @migration-task Error while migrating Svelte code: can't migrate `$: other = name;` to `$derived` because there's a variable named derived.
     Rename the variable and try again or migrate by hand. -->
<script>
	let name = 'world';

	let derived;

	$: other = name;
</script>

<input bind:value={name} />