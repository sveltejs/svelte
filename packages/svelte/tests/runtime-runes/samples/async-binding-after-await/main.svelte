<script>
	import Child from './Child.svelte';
	
	await Promise.resolve();

	let ref = $state(null);

	$effect(() => console.log(!!ref, value))

	let value = $state('value');
</script>

<Child bind:value />
<Child bind:value={() => value, v => value = v} />
<div bind:this={ref}>{!!ref}</div>
<input bind:value />
<input bind:value={() => value, v => value = v} />