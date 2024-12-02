<!-- @migration-task Error while migrating Svelte code: Encountered an export declaration pattern that is not supported for automigration. -->
<script>
	let props = { value: 42 };

	export let { value } = props;
</script>