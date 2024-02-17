<script>
	import Child from "./Child.svelte";

	let a = 0;
	let b = 0;
</script>

<button on:click={() => a += 1}>a: {a}</button>
<button on:click={() => b += 1}>b: {b}</button>
<Child {a} {b}/>
