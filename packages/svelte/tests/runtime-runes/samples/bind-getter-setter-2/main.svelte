<script>
	import Child from './Child.svelte';

	let child = $state();

	$effect(() => {
		console.log(child.someData);
	});
</script>

<Child bind:this={() => child, v => child = v} />
