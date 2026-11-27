<svelte:options runes={true} />

<script>
	import Render from './Render.svelte';
</script>

{#snippet content()}
	{#snippet nested()}
		<slot />
		<slot name="named" />
	{/snippet}

	<Render children={nested} />
{/snippet}

<Render children={content} />
