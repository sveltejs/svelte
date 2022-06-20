<script>
	import Nested from './Nested.svelte';

	export let foo;
</script>

<Nested>
	<p>unconditional</p>

	{#if foo}
		<p>conditional</p>
	{/if}
</Nested>