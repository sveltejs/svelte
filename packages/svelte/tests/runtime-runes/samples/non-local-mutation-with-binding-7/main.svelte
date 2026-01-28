<script>
	import Component1 from './Component1.svelte';

	let rows = $state([{}]);
</script>

<Component1 bind:rows />
