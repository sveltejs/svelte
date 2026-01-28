<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script>
	export let error = true;
</script>

{$$props}

<style lang="postcss">
	div{
		color: red;
	}
</style>