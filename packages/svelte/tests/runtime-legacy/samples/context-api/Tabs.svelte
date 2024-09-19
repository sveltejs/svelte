

<script module>
	export const TABS = {};
</script>

<script>
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	const tabs = [];
	const panels = [];
	const selectedTab = writable(null);
	const selectedPanel = writable(null);

	setContext(TABS, {
		registerTab: tab => {
			tabs.push(tab);
			selectedTab.update(current => current || tab);
		},

		unregisterTab: tab => {
			const i = tabs.indexOf(tab);
			tabs.splice(i, 1);
			selectedTab.update(current => current === tab ? (tabs[i] || tabs[tabs.length - 1]) : current);
		},

		registerPanel: panel => {
			panels.push(panel);
			selectedPanel.update(current => current || panel);
		},

		unregisterPanel: panel => {
			const i = panels.indexOf(panel);
			panels.splice(i, 1);
			selectedPanel.update(current => current === panel ? (panels[i] || panels[panels.length - 1]) : current);
		},

		selectTab: tab => {
			const i = tabs.indexOf(tab);
			selectedTab.set(tab);
			selectedPanel.set(panels[i]);
		},

		selectedTab,
		selectedPanel
	});
</script>

<div class="tabs">
	<slot></slot>
</div>