<script lang="ts">
	import Child from './Child.svelte';
	let value = $state(1);
</script>

<Child bind:value />
