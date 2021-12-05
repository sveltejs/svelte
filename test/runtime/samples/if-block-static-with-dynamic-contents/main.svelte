<script>
	export let foo;

	const show = () => true;
</script>

{#if show()}
	<p>{foo}</p>
{/if}
