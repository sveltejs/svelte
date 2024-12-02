<!-- @migration-task Error while migrating Svelte code: can't migrate `let other;` to `$derived` because there's a variable named derived.
     Rename the variable and try again or migrate by hand. -->
<script>
	let name = 'world';

	let derived;

	let other;
	$: other = name;
</script>

<input bind:value={name} />