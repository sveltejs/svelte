<!-- @migration-task Error while migrating Svelte code: can't migrate `$: other = name;` to `$derived` because there's a variable named derived -->
<script>
	let name = 'world';

	let derived;

	$: other = name;
</script>

<input bind:value={name} />