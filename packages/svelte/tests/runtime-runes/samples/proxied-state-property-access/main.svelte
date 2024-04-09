<script context="module">
	export const context = $state({
		settings: {
			showInRgb: true
		}
	})
</script>

<script>
	import Child from './Child.svelte';

	const { settings } = context
</script>

<button onclick={() => settings.showInRgb = !settings.showInRgb}>
	click {settings.showInRgb}
</button>

<Child settings={settings} />
