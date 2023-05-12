<script>
	import Nested from './Nested.svelte';
</script>

<Nested>
	{#each things as thing}
		<div slot='foo'>{thing}</div>
	{/each}
</Nested>