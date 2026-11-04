<script>
	import Child from './Child.svelte';

	let value = $state();
</script>

<svelte:head>
	<title>Page</title>
</svelte:head>

<Child bind:value />
