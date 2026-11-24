<script>
	import Child from './Child.svelte';

	const components = $state({});

	export function get_first() {
		return components.first;
	}
</script>

<Child bind:this={components.first} />
