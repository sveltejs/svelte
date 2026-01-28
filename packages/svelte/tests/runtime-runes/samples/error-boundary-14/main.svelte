<script>
	import Child from "./Child.svelte";
</script>

<svelte:boundary onerror={(e) => console.log('error caught')}>
	<Child />
</svelte:boundary>


