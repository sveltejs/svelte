<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$derived` but there's already a variable named derived -->
<script>
	let derived;
</script>

<svelte:component this={derived} />