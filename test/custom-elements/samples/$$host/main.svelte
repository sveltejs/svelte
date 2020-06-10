<svelte:options tag="custom-element"/>

<script>
	export function getHost() {
		return $$host;
	}

	export const host = $$host;
</script>

{typeof $$host}