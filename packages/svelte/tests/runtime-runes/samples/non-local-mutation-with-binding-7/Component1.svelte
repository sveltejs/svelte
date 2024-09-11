<script>
	import Component2 from './Component2.svelte';

	let { rows = $bindable([]) } = $props();

	let rows2 = $state([]);

	$effect(() => {
		rows2 = rows.slice();
	});
</script>

<Component2 bind:rows={rows2} />
