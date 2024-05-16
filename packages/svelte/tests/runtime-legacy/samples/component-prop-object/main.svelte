<script>
	import Child from "./Child.svelte";

	let x;
	$: if (!x) x = {y:0};
</script>

<Child x={x ?? {}} />
 
parent: {x.y} 
<button on:click={() => x.y++}>inc x</button>