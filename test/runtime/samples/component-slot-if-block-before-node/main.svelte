<script>
	import Nested from './Nested.svelte';

	export let foo;
</script>

<Nested>
	{#if foo}
		<p>conditional</p>
	{/if}

	<p>unconditional</p>
</Nested>