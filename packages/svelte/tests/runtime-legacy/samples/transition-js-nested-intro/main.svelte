<script>
	import Child from './Child.svelte';
	export let visible;
</script>

{#if visible}
	<Child>delayed</Child>
{/if}