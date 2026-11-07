<script>
	import Field from './Field.svelte';
</script>

<p>before</p>
{#if await Promise.resolve(true)}
	<Field />
{/if}
<p>after</p>
