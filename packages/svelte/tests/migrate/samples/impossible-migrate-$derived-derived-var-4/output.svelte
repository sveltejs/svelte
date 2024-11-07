<!-- @migration-task Error while migrating Svelte code: can't migrate `let other;` to `$derived` because there's a variable named derived -->
<script>
	let name = 'world';

	let derived;

	let other;
	$: other = name;
</script>

<input bind:value={name} />