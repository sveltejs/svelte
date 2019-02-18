<script>
	import { getContext, onDestroy } from 'svelte';
	import { TABS } from './Tabs.svelte';

	const panel = {};
	const { registerPanel, unregisterPanel, selectedPanel } = getContext(TABS);
	registerPanel(panel);

	onDestroy(() => {
		unregisterPanel(panel);
	});
</script>

{#if $selectedPanel === panel}
	<slot></slot>
{/if}