<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$derived` rune but there's already a variable named derived.
     Rename the variable and try again or migrate by hand. -->
<script>
	let derived;
</script>

<svelte:component this={derived} />