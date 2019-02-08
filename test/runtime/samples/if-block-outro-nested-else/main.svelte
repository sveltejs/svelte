<script>
	export let foo = true;

	import Component from './Component.svelte';
</script>

{#if foo}
	{#if false}
		<Component/>
	{:elseif false}
		<Component/>
	{/if}
{/if}
