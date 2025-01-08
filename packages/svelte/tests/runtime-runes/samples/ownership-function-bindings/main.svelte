<script>
	import Child from './Child.svelte';
	
	let arr = $state([]);
	let arr2 = $state([]);

	let len = $derived(arr.length + arr2.length);
</script>

<Child bind:arr={() => len % 2 === 0 ? arr : arr2, (v) => {}} />