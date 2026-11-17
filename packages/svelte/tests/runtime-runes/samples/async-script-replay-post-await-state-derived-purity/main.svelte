<script lang="ts">
	import Child from './Child.svelte';
</script>

<svelte:boundary>
	{#snippet failed(error)}
		<output>{error.message.split('\n')[0]}</output>
	{/snippet}
	<Child />
</svelte:boundary>
