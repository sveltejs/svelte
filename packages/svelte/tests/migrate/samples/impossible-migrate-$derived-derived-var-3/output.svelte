<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (derived to derived_1) making the component unusable -->
<script>
	let derived;
</script>
<Component>
	<slot name="derived" slot="derived" />
</Component>
