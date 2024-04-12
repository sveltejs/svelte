<script context="module">
	const context = $state({
		settings: {
			showInRgb: true
		}
	});

	export const settings = context.settings;
</script>

<script>
	import Child from './Child.svelte';
</script>

<button onclick={() => settings.showInRgb = !settings.showInRgb}>
	click {settings.showInRgb}
</button>

<Child />
