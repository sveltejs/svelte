<script>
	import Component from './Component.svelte';
	export let condition;
</script>

<Component>
	{#if condition}
		<svelte:fragment slot="d">
			<div>test</div>
		</svelte:fragment>
	{/if}

	<svelte:fragment slot="d">
		<div>test</div>
	</svelte:fragment>
</Component>
