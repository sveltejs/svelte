<script>
	import Nested from './Nested.svelte';

	export let enabled;
</script>

<Nested>
	{#if !enabled}
		<p>disabled</p>
	{:else}
		<p>enabled</p>
	{/if}

	<p>unconditional</p>
</Nested>