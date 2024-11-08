<!-- @migration-task Error while migrating Svelte code: migrating this component would require adding a `$bindable` rune but there's already a variable named bindable.
     Rename the variable and try again or migrate by hand. -->
<script>
	let bindable;
	export let something;
</script>

<input bind:value={something} />