<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	{#if thing}
		<div slot='foo'>{thing}</div>
	{/if}
</Nested>