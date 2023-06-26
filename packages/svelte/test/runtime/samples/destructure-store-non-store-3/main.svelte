<script>
	import { readable } from 'svelte/store'

	let store, nonStore;

	([nonStore, store] = [true, readable(true)]);
</script>

{#if $store}
	{nonStore}
{/if}
