<script>
	import  { readable } from 'svelte/store'

	let store, nonStore;

	const getExports = () => ({ nonStore: true, store: readable(true) });

	({ nonStore, store } = getExports());
</script>

{#if $store}
	{nonStore}
{/if}
