<script>
	import Tabs from './Tabs.svelte';
	import TabList from './TabList.svelte';
	import Tab from './Tab.svelte';
	import TabPanel from './TabPanel.svelte';

	export let show_medium = false;
</script>

<Tabs>
	<TabList>
		<Tab>small</Tab>
		{#if show_medium}<Tab>medium</Tab>{/if}
		<Tab>large</Tab>
	</TabList>

	<TabPanel>
		<h2>Small panel</h2>
	</TabPanel>

	{#if show_medium}
		<TabPanel>
			<h2>Medium panel</h2>
		</TabPanel>
	{/if}

	<TabPanel>
		<h2>Large panel</h2>
	</TabPanel>
</Tabs>