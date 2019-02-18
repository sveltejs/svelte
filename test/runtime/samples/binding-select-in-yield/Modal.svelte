<script>
	export let hidden = true;

	export function toggle() {
		hidden = !hidden;
	}
</script>

{#if !hidden}
	<slot></slot>
{/if}